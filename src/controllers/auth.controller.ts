// 📁 BE: src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { registerValidator, loginValidator } from '../validators/auth.validator';
import { EntityManager } from '@mikro-orm/core';

export const registerController = (em: EntityManager) => async (req: Request, res: Response) => {
  try {
    const data = registerValidator.parse(req.body);
    const user = await registerUser(em, data.email, data.password);
    res.status(201).json({ message: 'Đăng ký thành công', user: { id: user.id, email: user.email } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const loginController = (em: EntityManager) => async (req: Request, res: Response) => {
  try {
    const data = loginValidator.parse(req.body);
    const { token, user } = await loginUser(em, data.email, data.password);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Logout chỉ cần FE xoá token, không cần xử lý ở BE (trừ khi dùng sessions).
export const logoutController = async (_req: Request, res: Response) => {
  res.json({ message: 'Đăng xuất thành công (FE hãy xoá token)' });
};
