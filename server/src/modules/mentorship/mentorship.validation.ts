import { z } from 'zod';

export const createMentorProfileSchema = z.object({
  currentCompany: z.string().min(2).max(100),
  jobTitle: z.string().min(2).max(100),
  yearsExperience: z.number().int().min(0).max(50),
  bio: z.string().min(20).max(2000),
  areasOfExpertise: z.array(z.string().min(1)).min(1),
  hourlyAvailability: z.array(z.string()).default([]),
  maxMentees: z.number().int().min(1).max(50).default(10),
});

export const requestSessionSchema = z.object({
  topic: z.string().min(5).max(300),
  notes: z.string().max(2000).optional().default(''),
  proposedTimes: z.array(z.string().datetime()).min(1, 'Propose at least one potential time slot'),
});

export const proposeTimeSchema = z.object({
  proposedTimes: z.array(z.string().datetime()).min(1),
});

export const confirmSessionSchema = z.object({
  confirmedTime: z.string().datetime(),
  meetingLink: z.string().url().optional().or(z.literal('')),
});

export const feedbackSessionSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().min(5).max(1000),
});

export const createResourceSchema = z.object({
  title: z.string().min(3).max(200),
  category: z.enum(['frontend', 'backend', 'system_design', 'ai_ml', 'career', 'hackathons']),
  url: z.string().url(),
  description: z.string().min(10).max(1000),
  tags: z.array(z.string()).default([]),
});

export const requestReferralSchema = z.object({
  mentorId: z.string().min(1),
  companyName: z.string().min(2).max(100),
  role: z.string().min(2).max(100),
  resumeUrl: z.string().url(),
  note: z.string().max(1500).optional().default(''),
});

export const updateReferralSchema = z.object({
  status: z.enum(['pending', 'referred', 'declined']),
  feedback: z.string().max(1000).optional().default(''),
});
