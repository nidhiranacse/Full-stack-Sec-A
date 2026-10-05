import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Please provide a valid email'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    role: z.enum(['ADMIN', 'STUDENT']).optional().default('STUDENT')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Please provide a valid email'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password cannot be empty')
  })
});
