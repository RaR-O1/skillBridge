import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(4000),
  category: z.string().min(2, 'Category is required'),
  requiredSkills: z.array(z.string().min(1)).min(1, 'At least one required skill is needed'),
  budgetINR: z.number().int().min(500, 'Minimum budget is ₹500'),
  deadline: z.string().datetime({ message: 'Must be a valid ISO datetime' }),
});

export const applyProjectSchema = z.object({
  proposedBudgetINR: z.number().int().min(100, 'Proposed budget must be at least ₹100'),
  coverNote: z.string().min(10, 'Cover note must be at least 10 characters').max(2000),
});

export const submitDeliverableSchema = z.object({
  workUrl: z.string().url('Deliverable URL must be a valid URL (GitHub, Figma, Google Drive, Vercel, etc.)'),
  notes: z.string().max(2000).optional().default(''),
});
