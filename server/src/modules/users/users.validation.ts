import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(1000).optional(),
  college: z.string().max(200).optional(),
  businessName: z.string().max(200).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  skills: z
    .array(
      z.object({
        name: z.string().min(1),
        level: z.number().int().min(1).max(5),
      })
    )
    .optional(),
  visibility: z.boolean().optional(),
  optInChatSummary: z.boolean().optional(),
});
