import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/skillbridge'),
  JWT_SECRET: z.string().default('skillbridge-super-secret-dev-jwt-key-2026'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  FEATURE_PHASE_2_JOBS: z.string().default('true').transform(val => val === 'true'),
  FEATURE_PHASE_2_STARTUPS: z.string().default('true').transform(val => val === 'true'),
  FEATURE_PHASE_2_MENTORSHIP: z.string().default('true').transform(val => val === 'true'),
  FEATURE_AI_MATCHING: z.string().default('true').transform(val => val === 'true'),

  LLM_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().default('gemini-1.5-flash'),

  EMAIL_HOST: z.string().default('smtp.mailtrap.io'),
  EMAIL_PORT: z.string().default('2525').transform((val) => parseInt(val, 10)),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('notifications@skillbridge.edu'),

  SENTRY_DSN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
