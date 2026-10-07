import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(2).max(100),
  domain: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  logoUrl: z.string().url().optional().or(z.literal('')),
});

export const createJobSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
  title: z.string().min(3).max(200),
  type: z.enum(['internship', 'full_time', 'contract']),
  location: z.string().min(2).max(100),
  isRemote: z.boolean().default(false),
  stipendINR: z.number().int().min(0),
  requiredSkills: z.array(z.string().min(1)).min(1, 'At least one required skill is needed'),
  description: z.string().min(20).max(5000),
  deadline: z.string().datetime({ message: 'Must be a valid ISO datetime' }),
});

export const applyJobSchema = z.object({
  note: z.string().max(2000).optional().default(''),
});

export const updateStageSchema = z.object({
  stage: z.enum(['new', 'shortlisted', 'interview', 'offer', 'rejected']),
});

export const addNoteSchema = z.object({
  text: z.string().min(1).max(1000),
});

export const bulkUpdateStageSchema = z.object({
  applicationIds: z.array(z.string().min(1)).min(1),
  stage: z.enum(['new', 'shortlisted', 'interview', 'offer', 'rejected']),
});
