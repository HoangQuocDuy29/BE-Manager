import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  deadline: z.string().datetime(),
  priority: z.enum(['low', 'medium', 'high']),
  assignee: z.string().min(1),
});
