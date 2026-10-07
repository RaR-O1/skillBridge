import { Router } from 'express';
import { StartupsController } from './startups.controller.js';
import { requireFeature } from '../../config/featureFlags.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { applyLimiter } from '../../middleware/rateLimiter.js';
import {
  createStartupSchema,
  createRoleSchema,
  applyStartupRoleSchema,
  updateRoleStatusSchema,
  updateApplicationStatusSchema,
  createCoFounderProfileSchema,
} from './startups.validation.js';

export const startupsRouter = Router();

// Gated behind Phase 2 startups feature flag
startupsRouter.use(requireFeature('startupsAndRoles'));

// Co-Founder Matching
startupsRouter.get('/cofounders', optionalAuth, StartupsController.listCoFounders);
startupsRouter.get('/cofounders/me', requireAuth, StartupsController.getMyCoFounderProfile);
startupsRouter.post(
  '/cofounders/profile',
  requireAuth,
  validateBody(createCoFounderProfileSchema),
  StartupsController.upsertCoFounderProfile
);

// Startups profiles & directory
startupsRouter.get('/', optionalAuth, StartupsController.listStartups);
startupsRouter.get('/:id', optionalAuth, StartupsController.getStartupById);
startupsRouter.post('/', requireAuth, validateBody(createStartupSchema), StartupsController.createStartup);

// Open roles & applications
startupsRouter.post('/:id/roles', requireAuth, validateBody(createRoleSchema), StartupsController.addRole);
startupsRouter.patch(
  '/:id/roles/:roleId/status',
  requireAuth,
  validateBody(updateRoleStatusSchema),
  StartupsController.updateRoleStatus
);
startupsRouter.post(
  '/:id/roles/:roleId/apply',
  requireAuth,
  applyLimiter,
  validateBody(applyStartupRoleSchema),
  StartupsController.applyToRole
);
startupsRouter.get('/:id/applications', requireAuth, StartupsController.getStartupApplications);
startupsRouter.patch(
  '/applications/:appId/status',
  requireAuth,
  validateBody(updateApplicationStatusSchema),
  StartupsController.updateApplicationStatus
);
