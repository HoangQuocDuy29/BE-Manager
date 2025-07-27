import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/User';

export const findUserByEmail = async (em: EntityManager, email: string) => {
  return await em.findOne(User, { email });
};

export const createUser = async (em: EntityManager, email: string, hashedPassword: string) => {
  const user = new User();
  user.email = email;
  user.password = hashedPassword;
  await em.persistAndFlush(user);
  return user;
};
