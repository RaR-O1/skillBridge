import { z } from 'zod';

export const createReportSchema = z.object({
  targetUserId: z.string().optional(),
  projectId: z.string().optional(),
  chatRoomId: z.string().optional(),
  category: z.enum(['payment_not_received', 'spam', 'harassment', 'fraud', 'other']),
  description: z.string().min(10, 'Description must be at least 10 characters').max(3000),
  evidenceUrl: z.string().url().optional().or(z.literal('')),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(['investigating', 'resolved', 'dismissed']),
  resolutionNotes: z.string().max(2000).optional(),
  actionToTake: z.enum(['none', 'warn', 'suspend', 'ban']).optional().default('none'),
});
