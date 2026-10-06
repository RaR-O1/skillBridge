import { Router } from 'express';
import { requireFeature } from '../../config/featureFlags.js';

export const startupsRouter = Router();

startupsRouter.use(requireFeature('startupsAndRoles'));

startupsRouter.get('/', (_req, res) => {
  res.json({ success: true, data: { startups: [] } });
});
