// File: src/services/user.service.ts (MỚI)
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
      // Validate email không trùng (nếu update email)
      if (data.email) {
        const emailExists = await this.repo.emailExists(data.email, id);
        if (emailExists) {
          throw new Error('Email already exists');
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
  async getStats() {
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
      role: user.role?.name || user.role // Ensure role is string
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