// File: src/repositories/user.repository.ts (CẬP NHẬT - thêm CRUD methods)
import { SqlEntityManager } from '@mikro-orm/postgresql';
import { User, UserStatus } from '../entities/User'; // ← Import UserStatus enum
import { Role } from '../entities/Role';
import { RequiredEntityData } from '@mikro-orm/core';
import bcrypt from 'bcrypt';

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
      where.status = status as UserStatus; // ← Type assertion
    }

    // Search by email, username, fullName
    if (search?.trim()) {
      const searchTerm = search.trim();
      where.$or = [
        { email: { $ilike: `%${searchTerm}%` } },
        { username: { $ilike: `%${searchTerm}%` } },
        { fullName: { $ilike: `%${searchTerm}%` } }
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
    roleName: string; // 'admin' hoặc 'user'
  }) {
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Find role entity
    const role = await this.em.findOne(Role, { name: data.roleName });
    if (!role) {
      throw new Error(`Role '${data.roleName}' not found`);
    }

    // Create user entity - Để MikroORM tự handle createdAt
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
    if (data.email) user.email = data.email;
    if (data.username) user.username = data.username;
    if (data.fullName) user.fullName = data.fullName;
    if (data.phone) user.phone = data.phone;
    if (data.department) user.department = data.department;
    if (data.position) user.position = data.position;
    if (data.status) user.status = data.status as UserStatus; // ← Type assertion

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
      user.status = UserStatus.INACTIVE; // ← Use enum
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

  // UTILITY - get user stats
  async getStats() {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      recentUsers
    ] = await Promise.all([
      this.em.count(User),
      this.em.count(User, { status: UserStatus.ACTIVE }), // ← Use enum
      this.em.count(User, { role: { name: 'admin' } }),
      this.em.count(User, { 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      })
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      admins: adminUsers,
      recent: recentUsers
    };
  }
}

// ===== EXISTING FUNCTIONS (giữ lại cho compatibility) =====
export const findUserByEmail = async (em: SqlEntityManager, email: string) => {
  return await em.findOne(User, { email });
};

export const createUser = async (em: SqlEntityManager, email: string, hashedPassword: string, role: 'admin' | 'user') => {
  const user = new User();
  user.email = email;
  user.password = hashedPassword;

  const roleEntity = await em.findOne(Role, { name: role });
  if (roleEntity) {
    user.role = roleEntity;
  }

  await em.persistAndFlush(user);
  return user;
};