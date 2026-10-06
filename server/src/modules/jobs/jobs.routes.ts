import { Router } from 'express';
import { requireFeature } from '../../config/featureFlags.js';

export const jobsRouter = Router();

jobsRouter.use(requireFeature('jobsAndInternships'));

jobsRouter.get('/', (_req, res) => {
  res.json({ success: true, data: { jobs: [] } });
});
