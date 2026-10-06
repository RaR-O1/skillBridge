import { z } from 'zod';

export const createTeamSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(3000),
  hackathonName: z.string().min(2).max(100),
  skillsNeeded: z.array(z.string().min(1)).min(1, 'Please specify at least one skill needed'),
  teamSize: z.number().int().min(2).max(20),
  deadline: z.string().datetime({ message: 'Must be a valid ISO datetime' }),
});

export const applyTeamSchema = z.object({
  note: z.string().max(1000).optional().default(''),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
});
