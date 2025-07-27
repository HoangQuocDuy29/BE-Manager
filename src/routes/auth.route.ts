// 📁 BE: src/routes/auth.route.ts
import { Router } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { isAuthenticated } from '../middleware/isAuthenticated';
import {
  registerController,
  loginController,
  logoutController,
} from '../controllers/auth.controller';

export const authRouter = (em: EntityManager) => {
  const router = Router();

  // ✅ Đăng ký tài khoản
  router.post('/register', registerController(em));

  // ✅ Đăng nhập
  router.post('/login', loginController(em));

  // ✅ Đăng xuất
  router.post('/logout', logoutController);

  // ✅ Lấy thông tin user đang đăng nhập
  router.get('/me', isAuthenticated, (req, res) => {
    res.json({ user: req.user });
  });

  return router;
};
