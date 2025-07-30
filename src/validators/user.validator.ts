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
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .optional(),
  
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, 'Phone number must be 10-11 digits (Vietnamese format)')
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
  
  avatar: z
    .string()
    .url('Avatar must be a valid URL')
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
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .optional(),
  
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, 'Phone number must be 10-11 digits (Vietnamese format)')
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
  
  avatar: z
    .string()
    .url('Avatar must be a valid URL')
    .optional(),
  
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  
  roleName: z.enum(['admin', 'user']).optional(),
  
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters')
    .optional(),
  
  // Admin có thể update statistics
  totalOrders: z
    .number()
    .int('Total orders must be an integer')
    .min(0, 'Total orders cannot be negative')
    .optional(),

  totalSpending: z
    .number()
    .min(0, 'Total spending cannot be negative')
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
    .trim()
    .optional(),
  
  page: z
    .union([z.string(), z.number()])
    .transform(val => typeof val === 'string' ? parseInt(val, 10) : val)
    .refine(val => !isNaN(val) && val > 0, 'Page must be a positive number')
    .default(1),
  
  limit: z
    .union([z.string(), z.number()])
    .transform(val => typeof val === 'string' ? parseInt(val, 10) : val)
    .refine(val => !isNaN(val) && val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .default(10)
});

// ID parameter validator
export const userIdSchema = z.object({
  id: z
    .union([z.string(), z.number()])
    .transform(val => typeof val === 'string' ? parseInt(val, 10) : val)
    .refine(val => !isNaN(val) && val > 0, 'ID must be a positive number')
});

// Search query validator
export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(2, 'Search query must be at least 2 characters')
    .max(100, 'Search query must be less than 100 characters')
    .trim(),
  
  page: z
    .union([z.string(), z.number()])
    .transform(val => typeof val === 'string' ? parseInt(val, 10) : val)
    .refine(val => !isNaN(val) && val > 0, 'Page must be a positive number')
    .default(1),
  
  limit: z
    .union([z.string(), z.number()])
    .transform(val => typeof val === 'string' ? parseInt(val, 10) : val)
    .refine(val => !isNaN(val) && val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .default(10)
});

// Bulk operations validator
export const bulkUpdateUserSchema = z.object({
  userIds: z
    .array(z.number().int().positive('User ID must be a positive integer'))
    .min(1, 'At least one user ID is required')
    .max(50, 'Cannot update more than 50 users at once'),
  
  status: z.enum(['active', 'inactive', 'suspended'])
});

// Password change validator
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters')
    .max(50, 'New password must be less than 50 characters'),
  
  confirmPassword: z
    .string()
    .min(1, 'Confirm password is required')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Login validator (for auth)
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  
  password: z
    .string()
    .min(1, 'Password is required')
});

// Type exports for TypeScript
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserFiltersInput = z.infer<typeof userFiltersSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type BulkUpdateUserInput = z.infer<typeof bulkUpdateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Helper validation functions
export const validateEmail = (email: string): boolean => {
  return loginSchema.shape.email.safeParse(email).success;
};

export const validatePassword = (password: string): boolean => {
  return createUserSchema.shape.password.safeParse(password).success;
};

export const validatePhone = (phone: string): boolean => {
  return createUserSchema.shape.phone?.safeParse(phone).success ?? false;
};

// Custom error formatter - FIXED
export const formatZodError = (zodError: z.ZodError<any>) => {
  return zodError.issues.map((errorItem: z.ZodIssue) => ({
    field: errorItem.path.join('.'),
    message: errorItem.message,
    code: errorItem.code
  }));
};

