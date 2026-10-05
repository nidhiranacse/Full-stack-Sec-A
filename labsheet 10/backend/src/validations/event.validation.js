import { z } from 'zod';

export const createEventSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(3, 'Title must be at least 3 characters'),
    description: z.string({ required_error: 'Description is required' }).min(10, 'Description must be at least 10 characters'),
    date: z.string({ required_error: 'Date is required' }).refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format'
    }),
    location: z.string({ required_error: 'Location is required' }).min(2, 'Location is required'),
    category: z.enum(['ACADEMIC', 'CULTURAL', 'SPORTS', 'WORKSHOP', 'SEMINAR', 'GENERAL']).optional().default('GENERAL'),
    capacity: z.number({ required_error: 'Capacity is required' }).min(1, 'Capacity must be at least 1')
  })
});

export const updateEventSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format'
    }).optional(),
    location: z.string().min(2).optional(),
    category: z.enum(['ACADEMIC', 'CULTURAL', 'SPORTS', 'WORKSHOP', 'SEMINAR', 'GENERAL']).optional(),
    capacity: z.number().min(1).optional()
  })
});
