import { EntityManager } from '@mikro-orm/core';
import bcrypt from 'bcrypt';
import { createToken } from '../config/jwt';
import { findUserByEmail, createUser } from '../repositories/user.repository';

export const registerUser = async (em: EntityManager, email: string, password: string) => {
  const existing = await findUserByEmail(em, email);
  if (existing) throw new Error('Email đã tồn tại');

  const hashed = await bcrypt.hash(password, 10);
  const user = await createUser(em, email, hashed);

  return user;
};

export const loginUser = async (em: EntityManager, email: string, password: string) => {
  const user = await findUserByEmail(em, email);
  if (!user) throw new Error('Tài khoản không tồn tại');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Sai mật khẩu');

  const token = createToken({ id: user.id });
  return { token, user };
};
