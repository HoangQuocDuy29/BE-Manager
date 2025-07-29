// 📁 BE: src/repositories/user.repository.ts
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/User';
import { Role } from '../entities/Role';  // Import Role entity
import { RoleType } from '../entities/Role'; // Import RoleType enum

export const findUserByEmail = async (em: EntityManager, email: string) => {
  return await em.findOne(User, { email });
};

export const createUser = async (em: EntityManager, email: string, hashedPassword: string, role: 'admin' | 'user') => {
  const user = new User();
  user.email = email;
  user.password = hashedPassword;

  // Gán role cho user (role sẽ là 'admin' hoặc 'user')
  const roleEntity = await em.findOne(Role, { name: RoleType[role.toUpperCase() as keyof typeof RoleType] });  // Chuyển role thành chữ hoa
  if (roleEntity) {
    user.role = roleEntity;  // Gán mối quan hệ role cho user
  }

  await em.persistAndFlush(user);
  return user;
};
