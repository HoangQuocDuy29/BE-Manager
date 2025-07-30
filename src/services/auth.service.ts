// File: src/services/auth.service.ts (FIXED)
import { SqlEntityManager } from '@mikro-orm/postgresql'; // ← Thay đổi import
import bcrypt from 'bcrypt';
import { createToken } from '../config/jwt';
import { findUserByEmail, createUser } from '../repositories/user.repository';
import { Role } from '../entities/Role';
import { User } from '../entities/User';

export const registerUser = async (em: SqlEntityManager, email: string, password: string, role: 'admin' | 'user') => {
  const existing = await findUserByEmail(em, email);
  if (existing) throw new Error('Email đã tồn tại');

  const hashed = await bcrypt.hash(password, 10);
  
  // Tìm Role entity dựa trên 'admin' hoặc 'user'
  const roleEntity = await em.findOne(Role, { name: role });
  if (!roleEntity) throw new Error(`Role '${role}' not found`);

  const user = new User();
  user.email = email;
  user.password = hashed;
  user.role = roleEntity;

  await em.persistAndFlush(user);

  // Sử dụng em.populate() để đảm bảo role được load đầy đủ
  await em.populate(user, ['role']);

  return user;
};

export const loginUser = async (em: SqlEntityManager, email: string, password: string) => {
  const user = await findUserByEmail(em, email);
  if (!user) throw new Error('Tài khoản không tồn tại');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Sai mật khẩu');

  const token = createToken({ id: user.id });

  // Sử dụng populate để đảm bảo role được load đầy đủ
  await em.populate(user, ['role']);

  return { token, user };
};