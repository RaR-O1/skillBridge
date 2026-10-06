import { Router } from 'express';
import { requireFeature } from '../../config/featureFlags.js';

export const mentorshipRouter = Router();

mentorshipRouter.use(requireFeature('mentorship'));

mentorshipRouter.get('/mentors', (_req, res) => {
  res.json({ success: true, data: { mentors: [] } });
});
