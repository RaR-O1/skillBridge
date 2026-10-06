import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateBody } from '../../middleware/validate.js';
import {
  registerSchema,
  devLoginSchema,
  requestCollegeVerificationSchema,
  confirmCollegeVerificationSchema,
} from './auth.validation.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

export const authRouter = Router();

authRouter.post('/onboard', optionalAuth, validateBody(registerSchema), AuthController.onboard);
authRouter.post('/login', authLimiter, validateBody(devLoginSchema), AuthController.devLogin);
authRouter.get('/me', requireAuth, AuthController.getMe);

authRouter.post(
  '/verify-college/send',
  requireAuth,
  authLimiter,
  validateBody(requestCollegeVerificationSchema),
  AuthController.sendCollegeVerification
);

authRouter.post(
  '/verify-college/confirm',
  requireAuth,
  validateBody(confirmCollegeVerificationSchema),
  AuthController.verifyCollegeEmail
);
