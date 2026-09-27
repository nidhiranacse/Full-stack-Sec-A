const { z } = require('zod');

const registerSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name must be at least 2 characters'),
  email: z.string({ required_error: 'Email is required' }).trim().email('Invalid email address format'),
  password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['ADMIN', 'STUDENT'], {
    errorMap: () => ({ message: 'Role must be either ADMIN or STUDENT' }),
  }).optional().default('STUDENT'),
});

const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).trim().email('Invalid email address format'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password cannot be empty'),
});

const createEventSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).trim().min(3, 'Title must be at least 3 characters'),
  description: z.string({ required_error: 'Description is required' }).trim().min(5, 'Description must be at least 5 characters'),
  date: z.string({ required_error: 'Date is required' }).refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format (must be a valid ISO date)',
  }),
  location: z.string({ required_error: 'Location is required' }).trim().min(2, 'Location must be at least 2 characters'),
  category: z.string().trim().optional().default('General'),
  capacity: z.coerce.number().int().positive('Capacity must be a positive integer').optional().default(100),
});

const updateEventSchema = createEventSchema.partial();

const createAnnouncementSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).trim().min(3, 'Title must be at least 3 characters'),
  content: z.string({ required_error: 'Content is required' }).trim().min(5, 'Content must be at least 5 characters'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional().default('NORMAL'),
  category: z.string().trim().optional().default('General'),
});

module.exports = {
  registerSchema,
  loginSchema,
  createEventSchema,
  updateEventSchema,
  createAnnouncementSchema,
};
