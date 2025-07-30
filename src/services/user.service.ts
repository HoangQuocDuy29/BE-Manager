// File: src/services/user.service.ts (UPDATED - bỏ hết logging)
import { UserRepository } from '../repositories/user.repository';

export interface CreateUserDTO {
  email: string;
  password: string;
  username?: string;
  fullName?: string;
  phone?: string;
  department?: string;
  position?: string;
  roleName: string;
}

export interface UpdateUserDTO {
  email?: string;
  username?: string;
  fullName?: string;
  phone?: string;
  department?: string;
  position?: string;
  status?: string;
  roleName?: string;
  password?: string;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  newUsers: number;
  activePercentage: number;
  byRole: {
    admin: number;
    user: number;
  };
  byDepartment: { [key: string]: number };
}

export class UserService {
  constructor(private readonly repo: UserRepository) {}

  // GET ALL users với filters
  async getAll(filters: UserFilters = {}) {
    try {
      return await this.repo.findAll(filters);
    } catch (error) {
      throw new Error(`Failed to get users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // GET ONE user by ID
  async getOne(id: number) {
    try {
      const user = await this.repo.findOne(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // CREATE new user
  async create(data: CreateUserDTO) {
    try {
      // Validate email không trùng
      const emailExists = await this.repo.emailExists(data.email);
      if (emailExists) {
        throw new Error('Email already exists');
      }

      // Validate role
      if (!['admin', 'user'].includes(data.roleName)) {
        throw new Error('Invalid role. Must be admin or user');
      }

      // Additional validation
      if (!data.email || !data.password) {
        throw new Error('Email and password are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error('Invalid email format');
      }

      // Validate password strength
      if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const user = await this.repo.create(data);
      
      // Return user without password
      return this.sanitizeUser(user);
    } catch (error) {
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // UPDATE user
  async update(id: number, data: UpdateUserDTO) {
    try {
      // Check if user exists first
      const existingUser = await this.repo.findOne(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Validate email không trùng (nếu update email)
      if (data.email && data.email !== existingUser.email) {
        const emailExists = await this.repo.emailExists(data.email, id);
        if (emailExists) {
          throw new Error('Email already exists');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          throw new Error('Invalid email format');
        }
      }

      // Validate role
      if (data.roleName && !['admin', 'user'].includes(data.roleName)) {
        throw new Error('Invalid role. Must be admin or user');
      }

      // Validate status
      if (data.status && !['active', 'inactive', 'suspended'].includes(data.status)) {
        throw new Error('Invalid status. Must be active, inactive, or suspended');
      }

      // Validate password if updating
      if (data.password && data.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const user = await this.repo.update(id, data);
      
      // Return user without password
      return this.sanitizeUser(user);
    } catch (error) {
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // DELETE user (soft delete by default)
  async delete(id: number, hardDelete = false) {
    try {
      // Check if user exists first
      const existingUser = await this.repo.findOne(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Prevent deleting admin users (safety check)
      if (existingUser.role?.name === 'admin' && hardDelete) {
        throw new Error('Cannot permanently delete admin users');
      }

      const result = await this.repo.delete(id, !hardDelete);
      
      if (hardDelete) {
        return { message: 'User permanently deleted' };
      } else {
        return { 
          message: 'User deactivated', 
          user: this.sanitizeUser(result!) 
        };
      }
    } catch (error) {
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // GET user stats for dashboard
  async getStats(): Promise<UserStats> {
    try {
      return await this.repo.getStats();
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // SEARCH users
  async search(keyword: string, page = 1, limit = 10) {
    try {
      if (!keyword?.trim()) {
        throw new Error('Search keyword is required');
      }

      if (keyword.trim().length < 2) {
        throw new Error('Search keyword must be at least 2 characters');
      }

      return await this.repo.findAll({
        search: keyword.trim(),
        page,
        limit
      });
    } catch (error) {
      throw new Error(`Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // HELPER: Remove password from user object
  private sanitizeUser(user: any) {
    if (!user) return null;
    
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      role: user.role?.name || user.role, // Ensure role is string
      // Format dates for frontend
      joinedDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : null,
      lastLoginDate: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString().split('T')[0] : null,
      // Format spending
      formattedSpending: user.totalSpending ? `${user.totalSpending.toLocaleString('vi-VN')}₫` : '0₫'
    };
  }

  // HELPER: Sanitize users array
  private sanitizeUsers(users: any[]) {
    return users.map(user => this.sanitizeUser(user));
  }

  // GET ALL (sanitized version for public endpoints)
  async getAllSanitized(filters: UserFilters = {}) {
    const result = await this.getAll(filters);
    return {
      ...result,
      users: this.sanitizeUsers(result.users)
    };
  }
}
