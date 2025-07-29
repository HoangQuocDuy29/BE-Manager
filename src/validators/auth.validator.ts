// 📁 BE: src/validators/auth.validator.ts
import { z } from 'zod';

// Validator cho đăng ký, bao gồm kiểm tra role (admin hoặc user)
export const registerValidator = z.object({
  email: z.string().email(),  // Kiểm tra email hợp lệ
  password: z.string().min(6),  // Kiểm tra mật khẩu có ít nhất 6 ký tự
  role: z.enum(['admin', 'user']),  // Thêm validator cho role, chỉ nhận 'admin' hoặc 'user'
});

// Validator cho đăng nhập (không cần role)
export const loginValidator = z.object({
  email: z.string().email(),  // Kiểm tra email hợp lệ
  password: z.string().min(6),  // Kiểm tra mật khẩu có ít nhất 6 ký tự
});
