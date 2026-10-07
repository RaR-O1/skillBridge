import { z } from 'zod';

export const createStartupSchema = z.object({
  name: z.string().min(2).max(100),
  pitch: z.string().min(5).max(300),
  description: z.string().min(20).max(5000),
  stage: z.enum(['ideation', 'mvp', 'early_traction', 'scaling']).default('ideation'),
  website: z.string().url().optional().or(z.literal('')),
});

export const createRoleSchema = z.object({
  roleTitle: z.string().min(3).max(100),
  roleType: z.enum(['co_founder', 'intern', 'contributor']),
  requiredSkills: z.array(z.string().min(1)).min(1),
  equityOrStipend: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
});

export const applyStartupRoleSchema = z.object({
  coverLetter: z.string().max(2000).optional().default(''),
});

export const updateRoleStatusSchema = z.object({
  status: z.enum(['open', 'closed']),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'accepted', 'rejected']),
});

export const createCoFounderProfileSchema = z.object({
  college: z.string().max(100).optional(),
  bio: z.string().min(10).max(1000),
  skills: z.array(z.string().min(1)).min(1),
  idealCoFounderRole: z.string().min(3).max(100),
  targetIndustry: z.string().min(2).max(100),
  hoursPerWeek: z.number().int().min(5).max(80),
  lookingFor: z.string().min(10).max(1000),
  active: z.boolean().default(true),
});
