import { Router } from 'express';
import { AiController } from './ai.controller.js';
import { requireFeature } from '../../config/featureFlags.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.js';
import { aiLimiter } from '../../middleware/rateLimiter.js';

export const aiRouter = Router();

// Gated behind AI feature flag and rate limiting
aiRouter.use(requireFeature('aiMatching'));
aiRouter.use(aiLimiter);

// Scope helper is accessible to all authentic users or guests drafting projects
aiRouter.post('/scope-helper', optionalAuth, AiController.generateProjectScope);

// Profile feedback & chat summary require authentication
aiRouter.get('/profile-feedback', requireAuth, AiController.getProfileFeedback);
aiRouter.get('/chat-summary/:roomId', requireAuth, AiController.generateChatSummary);
