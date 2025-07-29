// 📁 BE: src/middleware/isAuthenticated.ts
import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import { Role } from '../entities/Role';  // Import Role entity

// Định nghĩa kiểu cho req.user
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      role: Role;  // Gán role là kiểu Role
    }
  }
}

// Middleware để xác thực JWT
export const isAuthenticated = passport.authenticate('jwt', { session: false });
