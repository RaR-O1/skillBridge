import { Router } from 'express';
import { requireFeature } from '../../config/featureFlags.js';

export const aiRouter = Router();

aiRouter.use(requireFeature('aiMatching'));

aiRouter.post('/scope-helper', (_req, res) => {
  res.json({ success: true, data: { scope: null } });
});
