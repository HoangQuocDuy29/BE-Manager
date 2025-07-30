// File: src/repositories/user.repository.ts (UPDATED - fixed UserStats and enhanced CRUD)
import { SqlEntityManager } from '@mikro-orm/postgresql';
import { User, UserStatus } from '../entities/User';
import { Role } from '../entities/Role';
import { RequiredEntityData } from '@mikro-orm/core';
import bcrypt from 'bcrypt';

// Interface để match với UserService expectations
interface UserStats {
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

export class UserRepository {
  constructor(private readonly em: SqlEntityManager) {}

  // GET ALL - với filters và pagination
  async findAll(filters: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { role, status, search, page = 1, limit = 10 } = filters;
    const where: any = {};

    // Filter by role
    if (role) {
      where.role = { name: role };
    }

    // Filter by status
    if (status) {
      where.status = status as UserStatus;
    }

    // Search by email, username, fullName, phone
    if (search?.trim()) {
      const searchTerm = search.trim();
      where.$or = [
        { email: { $ilike: `%${searchTerm}%` } },
        { username: { $ilike: `%${searchTerm}%` } },
        { fullName: { $ilike: `%${searchTerm}%` } },
        { phone: { $ilike: `%${searchTerm}%` } }
      ];
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get users with total count
    const [users, total] = await Promise.all([
      this.em.find(User, where, {
        populate: ['role'],
        limit,
        offset,
        orderBy: { createdAt: 'DESC' }
      }),
      this.em.count(User, where)
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // GET ONE - by ID
  async findOne(id: number) {
    return this.em.findOne(User, { id }, { populate: ['role'] });
  }

  // GET ONE - by email (for login/register)
  async findByEmail(email: string) {
    return this.em.findOne(User, { email }, { populate: ['role'] });
  }

  // CREATE - tạo user mới
  async create(data: {
    email: string;
    password: string;
    username?: string;
    fullName?: string;
    phone?: string;
    department?: string;
    position?: string;
    roleName: string;
  }) {
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Find role entity
    const role = await this.em.findOne(Role, { name: data.roleName });
    if (!role) {
      throw new Error(`Role '${data.roleName}' not found`);
    }

    // Create user entity
    const user = new User();
    user.email = data.email;
    user.password = hashedPassword;
    user.username = data.username;
    user.fullName = data.fullName;
    user.phone = data.phone;
    user.department = data.department;
    user.position = data.position;
    user.role = role;
    user.status = UserStatus.ACTIVE;
    user.totalOrders = 0;
    user.totalSpending = 0;
    
    await this.em.persistAndFlush(user);

    // Populate role before returning
    await this.em.populate(user, ['role']);
    return user;
  }

  // UPDATE - cập nhật user
  async update(id: number, data: {
    email?: string;
    username?: string;
    fullName?: string;
    phone?: string;
    department?: string;
    position?: string;
    status?: string;
    roleName?: string;
    password?: string;
    totalOrders?: number;
    totalSpending?: number;
  }) {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Update role if provided
    if (data.roleName) {
      const role = await this.em.findOne(Role, { name: data.roleName });
      if (!role) {
        throw new Error(`Role '${data.roleName}' not found`);
      }
      user.role = role;
    }

    // Hash password if provided
    if (data.password) {
      user.password = await bcrypt.hash(data.password, 10);
    }

    // Update other fields
    if (data.email !== undefined) user.email = data.email;
    if (data.username !== undefined) user.username = data.username;
    if (data.fullName !== undefined) user.fullName = data.fullName;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.department !== undefined) user.department = data.department;
    if (data.position !== undefined) user.position = data.position;
    if (data.status) user.status = data.status as UserStatus;
    if (data.totalOrders !== undefined) user.totalOrders = data.totalOrders;
    if (data.totalSpending !== undefined) user.totalSpending = data.totalSpending;

    user.updatedAt = new Date();

    await this.em.flush();
    await this.em.populate(user, ['role']);
    return user;
  }

  // DELETE - xóa user (soft delete bằng cách set status = 'inactive')
  async delete(id: number, softDelete = true) {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (softDelete) {
      // Soft delete - set status to inactive
      user.status = UserStatus.INACTIVE;
      user.updatedAt = new Date();
      await this.em.flush();
      return user;
    } else {
      // Hard delete - remove from database
      await this.em.removeAndFlush(user);
      return null;
    }
  }

  // UTILITY - check if email exists (for validation)
  async emailExists(email: string, excludeId?: number) {
    const where: any = { email };
    if (excludeId) {
      where.id = { $ne: excludeId };
    }
    const user = await this.em.findOne(User, where);
    return !!user;
  }

  // UTILITY - get user stats (FIXED to match UserStats interface)
  async getStats(): Promise<UserStats> {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      adminUsers,
      regularUsers,
      recentUsers
    ] = await Promise.all([
      this.em.count(User),
      this.em.count(User, { status: UserStatus.ACTIVE }),
      this.em.count(User, { status: UserStatus.INACTIVE }),
      this.em.count(User, { status: UserStatus.SUSPENDED }),
      this.em.count(User, { role: { name: 'admin' } }),
      this.em.count(User, { role: { name: 'user' } }),
      this.em.count(User, { 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // Get department statistics
    const departmentStats = await this.getDepartmentStats();

    // Calculate active percentage
    const activePercentage = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      suspended: suspendedUsers,
      newUsers: recentUsers,
      activePercentage,
      byRole: {
        admin: adminUsers,
        user: regularUsers
      },
      byDepartment: departmentStats
    };
  }

  // UTILITY - get department statistics
  private async getDepartmentStats(): Promise<{ [key: string]: number }> {
    try {
      const result = await this.em.createQueryBuilder(User, 'u')
        .select(['u.department', 'COUNT(u.id) as count'])
        .where('u.department IS NOT NULL AND u.department != ""')
        .groupBy('u.department')
        .execute('all'); ;

      const departmentStats: { [key: string]: number } = {};
      result.forEach((row: any) => {
        if (row.department) {
          departmentStats[row.department] = parseInt(row.count, 10);
        }
      });

      return departmentStats;
    } catch (error) {
      console.error('Error getting department stats:', error);
      return {};
    }
  }

  // UTILITY - search users (enhanced search)
  async searchUsers(query: string, page = 1, limit = 10) {
    const searchTerm = query.trim();
    if (!searchTerm) {
      return this.findAll({ page, limit });
    }

    return this.findAll({
      search: searchTerm,
      page,
      limit
    });
  }

  // UTILITY - get users by role
  async getUsersByRole(roleName: string, page = 1, limit = 10) {
    return this.findAll({
      role: roleName,
      page,
      limit
    });
  }

  // UTILITY - get active users only
  async getActiveUsers(page = 1, limit = 10) {
    return this.findAll({
      status: UserStatus.ACTIVE,
      page,
      limit
    });
  }

  // UTILITY - bulk update users status
  async bulkUpdateStatus(userIds: number[], status: UserStatus) {
    const users = await this.em.find(User, { id: { $in: userIds } });
    
    if (users.length === 0) {
      throw new Error('No users found for bulk update');
    }

    for (const user of users) {
      user.status = status;
      user.updatedAt = new Date();
    }

    await this.em.flush();
    return users;
  }

  // UTILITY - update user last login
  async updateLastLogin(userId: number) {
    const user = await this.findOne(userId);
    if (user) {
      user.lastLoginAt = new Date();
      await this.em.flush();
    }
    return user;
  }
}

// ===== EXISTING FUNCTIONS (giữ lại cho compatibility) =====
export const findUserByEmail = async (em: SqlEntityManager, email: string) => {
  return await em.findOne(User, { email }, { populate: ['role'] });
};

export const createUser = async (em: SqlEntityManager, email: string, hashedPassword: string, role: 'admin' | 'user') => {
  const user = new User();
  user.email = email;
  user.password = hashedPassword;
  user.status = UserStatus.ACTIVE;
  user.totalOrders = 0;
  user.totalSpending = 0;

  const roleEntity = await em.findOne(Role, { name: role });
  if (roleEntity) {
    user.role = roleEntity;
  }

  await em.persistAndFlush(user);
  return user;
};
