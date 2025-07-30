// File: src/routes/auth.route.ts (FIXED)
import { Router } from 'express';
import { SqlEntityManager } from '@mikro-orm/postgresql'; // ← Thay đổi import
import { isAuthenticated } from '../middleware/isAuthenticated';
import {
  registerController,
  loginController,
  logoutController,
} from '../controllers/auth.controller';

export const authRouter = (em: SqlEntityManager) => { // ← Thay đổi parameter type
  const router = Router();

  // ✅ Đăng ký tài khoản
  router.post('/register', registerController(em));

  // ✅ Đăng nhập
  router.post('/login', loginController(em));

  // ✅ Đăng xuất
  router.post('/logout', logoutController);

  // ✅ Lấy thông tin user đang đăng nhập
  router.get('/me', isAuthenticated, (req, res) => {
    // Trả về thông tin người dùng bao gồm role dưới dạng chuỗi (admin hoặc user)
    res.json({ user: { 
      id: req.user?.id, 
      email: req.user?.email, 
      role: req.user?.role.name,  // Trả về role dưới dạng chuỗi (admin, user)
    } });
  });

  return router;
};