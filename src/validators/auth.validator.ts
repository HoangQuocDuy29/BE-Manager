// 📁 BE: src/validators/auth.validator.ts
import { z } from 'zod';

export const registerValidator = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginValidator = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
