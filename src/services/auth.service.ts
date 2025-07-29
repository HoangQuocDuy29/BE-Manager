// 📁 BE: src/services/auth.service.ts
import { EntityManager } from '@mikro-orm/core';
import bcrypt from 'bcrypt';
import { createToken } from '../config/jwt';
import { findUserByEmail, createUser } from '../repositories/user.repository';
import { Role } from '../entities/Role';
import { User } from '../entities/User';  // Import User entity

export const registerUser = async (em: EntityManager, email: string, password: string, role: 'admin' | 'user') => {
  const existing = await findUserByEmail(em, email);
  if (existing) throw new Error('Email đã tồn tại');

  const hashed = await bcrypt.hash(password, 10);
  
  // Tìm Role entity dựa trên 'admin' hoặc 'user'
  const roleEntity = await em.findOne(Role, { name: role });
  if (!roleEntity) throw new Error(`Role '${role}' not found`);

  const user = new User();  // Tạo đối tượng User
  user.email = email;
  user.password = hashed;
  user.role = roleEntity;

  await em.persistAndFlush(user);

  // Sử dụng em.populate() để đảm bảo role được load đầy đủ
  await em.populate(user, ['role']);  // Đảm bảo role được load đầy đủ trước khi trả về

  return user;
};

export const loginUser = async (em: EntityManager, email: string, password: string) => {
  const user = await findUserByEmail(em, email);
  if (!user) throw new Error('Tài khoản không tồn tại');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Sai mật khẩu');

  const token = createToken({ id: user.id });

  // Sử dụng populate để đảm bảo role được load đầy đủ
  await em.populate(user, ['role']);  // Load relation role trước khi trả về

  return { token, user };
};
