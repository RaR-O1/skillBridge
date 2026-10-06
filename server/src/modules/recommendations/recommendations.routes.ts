import { Router } from 'express';
import { requireFeature } from '../../config/featureFlags.js';

export const recommendationsRouter = Router();

recommendationsRouter.use(requireFeature('aiMatching'));

recommendationsRouter.get('/', (_req, res) => {
  res.json({ success: true, data: { recommendations: [] } });
});
