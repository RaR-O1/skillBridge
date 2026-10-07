import { Router } from 'express';
import { MentorshipController } from './mentorship.controller.js';
import { requireFeature } from '../../config/featureFlags.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { applyLimiter } from '../../middleware/rateLimiter.js';
import {
  createMentorProfileSchema,
  requestSessionSchema,
  proposeTimeSchema,
  confirmSessionSchema,
  feedbackSessionSchema,
  createResourceSchema,
  requestReferralSchema,
  updateReferralSchema,
} from './mentorship.validation.js';

export const mentorshipRouter = Router();

// Gated behind Phase 2 mentorship feature flag
mentorshipRouter.use(requireFeature('mentorship'));

// Mentor profiles
mentorshipRouter.get('/mentors', optionalAuth, MentorshipController.listMentors);
mentorshipRouter.get('/mentors/:id', optionalAuth, MentorshipController.getMentorById);
mentorshipRouter.post(
  '/mentors/profile',
  requireAuth,
  validateBody(createMentorProfileSchema),
  MentorshipController.upsertMentorProfile
);

// Sessions lifecycle
mentorshipRouter.get('/sessions', requireAuth, MentorshipController.listMySessions);
mentorshipRouter.post(
  '/sessions/request/:mentorId',
  requireAuth,
  applyLimiter,
  validateBody(requestSessionSchema),
  MentorshipController.requestSession
);
mentorshipRouter.patch(
  '/sessions/:sessionId/propose-times',
  requireAuth,
  validateBody(proposeTimeSchema),
  MentorshipController.proposeTimes
);
mentorshipRouter.patch(
  '/sessions/:sessionId/confirm',
  requireAuth,
  validateBody(confirmSessionSchema),
  MentorshipController.confirmSession
);
mentorshipRouter.post(
  '/sessions/:sessionId/feedback',
  requireAuth,
  validateBody(feedbackSessionSchema),
  MentorshipController.submitFeedback
);

// Learning Resources
mentorshipRouter.get('/resources', optionalAuth, MentorshipController.listResources);
mentorshipRouter.post(
  '/resources',
  requireAuth,
  validateBody(createResourceSchema),
  MentorshipController.createResource
);

// Alumni Referrals
mentorshipRouter.get('/referrals', requireAuth, MentorshipController.listMyReferrals);
mentorshipRouter.post(
  '/referrals',
  requireAuth,
  applyLimiter,
  validateBody(requestReferralSchema),
  MentorshipController.requestReferral
);
mentorshipRouter.patch(
  '/referrals/:referralId',
  requireAuth,
  validateBody(updateReferralSchema),
  MentorshipController.updateReferralStatus
);
