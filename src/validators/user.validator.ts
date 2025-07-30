// File: src/validators/user.validator.ts (FIXED)
import { z } from 'zod';

// CREATE user validator
export const createUserSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters'),
  
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters')
    .max(30, 'Username must be less than 30 characters')
    .optional(),
  
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .optional(),
  
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .optional(),
  
  department: z
    .string()
    .min(2, 'Department must be at least 2 characters')
    .max(50, 'Department must be less than 50 characters')
    .optional(),
  
  position: z
    .string()
    .min(2, 'Position must be at least 2 characters')
    .max(50, 'Position must be less than 50 characters')
    .optional(),
  
  roleName: z.enum(['admin', 'user'])
});

// UPDATE user validator (all fields optional except those being updated)
export const updateUserSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .optional(),
  
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters')
    .max(30, 'Username must be less than 30 characters')
    .optional(),
  
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .optional(),
  
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .optional(),
  
  department: z
    .string()
    .min(2, 'Department must be at least 2 characters')
    .max(50, 'Department must be less than 50 characters')
    .optional(),
  
  position: z
    .string()
    .min(2, 'Position must be at least 2 characters')
    .max(50, 'Position must be less than 50 characters')
    .optional(),
  
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  
  roleName: z.enum(['admin', 'user']).optional(),
  
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters')
    .optional()
});

// Query filters validator
export const userFiltersSchema = z.object({
  role: z.enum(['admin', 'user']).optional(),
  
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  
  search: z
    .string()
    .min(1, 'Search term must be at least 1 character')
    .max(100, 'Search term must be less than 100 characters')
    .optional(),
  
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a positive number')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, 'Page must be greater than 0')
    .optional(),
  
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a positive number')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .optional()
});

// ID parameter validator
export const userIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a valid number')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, 'ID must be a positive number')
});

// Search query validator
export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query must be less than 100 characters'),
  
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a positive number')
    .transform(val => parseInt(val, 10))
    .optional(),
  
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a positive number')
    .transform(val => parseInt(val, 10))
    .optional()
});

// Type exports for TypeScript
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserFiltersInput = z.infer<typeof userFiltersSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;