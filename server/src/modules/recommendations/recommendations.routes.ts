import { Router } from 'express';
import { RecommendationsController } from './recommendations.controller.js';
import { requireFeature } from '../../config/featureFlags.js';
import { requireAuth } from '../../middleware/auth.js';

export const recommendationsRouter = Router();

// Gated behind AI matching feature flag
recommendationsRouter.use(requireFeature('aiMatching'));
recommendationsRouter.use(requireAuth);

recommendationsRouter.get('/', RecommendationsController.getRecommendations);
recommendationsRouter.post('/feedback', RecommendationsController.recordFeedback);
