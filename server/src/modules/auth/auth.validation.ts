import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  role: z.enum(['student', 'local_business', 'company', 'startup', 'mentor', 'admin']),
  college: z.string().max(200).optional(),
  collegeEmail: z.string().email('Invalid college email').optional(),
  businessName: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
  skills: z.array(
    z.object({
      name: z.string().min(1, 'Skill name cannot be empty'),
      level: z.number().min(1).max(5).default(3),
    })
  ).optional().default([]),
});

export const devLoginSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['student', 'local_business', 'company', 'startup', 'mentor', 'admin']).optional(),
});

export const requestCollegeVerificationSchema = z.object({
  collegeEmail: z
    .string()
    .email('Invalid college email')
    .refine(
      (email) =>
        email.endsWith('.edu') ||
        email.endsWith('.ac.in') ||
        email.endsWith('.edu.in') ||
        email.includes('.college.') ||
        email.includes('.uni.'),
      {
        message: 'Must be a valid institutional/college email (.edu, .ac.in, .edu.in, etc.)',
      }
    ),
});

export const confirmCollegeVerificationSchema = z.object({
  collegeEmail: z.string().email(),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});
