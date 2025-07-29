// 📁 BE: src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { registerValidator, loginValidator } from '../validators/auth.validator';
import { EntityManager } from '@mikro-orm/core';

// Controller đăng ký người dùng
export const registerController = (em: EntityManager) => async (req: Request, res: Response) => {
  try {
    // Kiểm tra dữ liệu đăng ký từ request body
    const data = registerValidator.parse(req.body);
    const user = await registerUser(em, data.email, data.password, data.role); // Đăng ký người dùng
    
    // Sử dụng populate để đảm bảo role được load đầy đủ
    await em.populate(user, ['role']);  // Populate mối quan hệ với Role

    // Kiểm tra xem role đã được load đúng cách chưa
    if (user.role) {
      res.status(201).json({
        message: 'Đăng ký thành công',
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role.name  // Trả về role.name từ đối tượng Role
        }
      });
    } else {
      throw new Error('Role không hợp lệ');
    }

  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Controller đăng nhập người dùng
export const loginController = (em: EntityManager) => async (req: Request, res: Response) => {
  try {
    // Kiểm tra dữ liệu đăng nhập từ request body
    const data = loginValidator.parse(req.body);
    const { token, user } = await loginUser(em, data.email, data.password); // Đăng nhập và lấy token và user

    // Sử dụng populate để đảm bảo role được load đầy đủ
    await em.populate(user, ['role']);  // Populate mối quan hệ với Role

    // Kiểm tra xem role đã được load đúng cách chưa
    if (user.role) {
      res.json({
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role.name  // Trả về role.name từ đối tượng Role
        }
      });
    } else {
      throw new Error('Role không hợp lệ');
    }

  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Controller đăng xuất người dùng (FE chỉ cần xóa token)
export const logoutController = async (_req: Request, res: Response) => {
  res.json({ message: 'Đăng xuất thành công (FE hãy xoá token)' });
};
