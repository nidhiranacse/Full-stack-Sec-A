import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(3, 'Title must be at least 3 characters'),
    message: z.string({ required_error: 'Message is required' }).min(5, 'Message must be at least 5 characters'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM')
  })
});
