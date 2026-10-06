import { z } from 'zod';

export const verifyUserActionSchema = z.object({
  type: z.enum(['college', 'business']),
  approved: z.boolean(),
  reason: z.string().max(500).optional(),
});

export const moderateUserSchema = z.object({
  action: z.enum(['warn', 'suspend', 'ban', 'reactivate']),
  reason: z.string().min(5, 'Reason is required').max(1000),
});
