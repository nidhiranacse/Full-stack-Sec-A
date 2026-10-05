import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['student', 'admin']).optional().default('student'),
  studentId: z.string().optional(),
  department: z.string().optional(),
  semester: z.coerce.number().min(1).max(8).optional().default(5)
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['Workshop', 'Hackathon', 'Placement Drive', 'Seminar', 'Cultural']),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  time: z.string().min(1, 'Time is required'),
  venue: z.string().min(2, 'Venue is required'),
  maxSeats: z.coerce.number().min(1, 'Maximum seats must be at least 1').default(50),
  organizer: z.string().optional(),
  speaker: z.string().optional()
});

export const resourceSchema = z.object({
  title: z.string().min(3, 'Resource title must be at least 3 characters'),
  description: z.string().optional(),
  subject: z.string().min(2, 'Subject is required'),
  semester: z.coerce.number().min(1).max(8),
  category: z.enum(['Notes', 'Previous Year Paper', 'Lab Manual', 'Reference Book', 'Syllabus']).default('Notes')
});

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.parse(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errorMessages = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages
        });
      }
      next(err);
    }
  };
};
