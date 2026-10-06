import { z } from 'zod';

export const createPortfolioItemSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().min(10).max(2000),
  projectUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  repoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  skills: z.array(z.string()).default([]),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  featured: z.boolean().optional().default(false),
});

export const updatePortfolioItemSchema = createPortfolioItemSchema.partial();

export const createReviewSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required'),
  projectId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});
