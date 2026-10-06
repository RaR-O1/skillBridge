import { Router } from 'express';
import { TeamsController } from './teams.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { createTeamSchema, applyTeamSchema, updateApplicationStatusSchema } from './teams.validation.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.js';
import { applyLimiter } from '../../middleware/rateLimiter.js';

export const teamsRouter = Router();

teamsRouter.get('/', optionalAuth, TeamsController.listTeams);
teamsRouter.get('/:id', optionalAuth, TeamsController.getTeamById);
teamsRouter.post('/', requireAuth, validateBody(createTeamSchema), TeamsController.createTeam);
teamsRouter.post('/:id/apply', requireAuth, applyLimiter, validateBody(applyTeamSchema), TeamsController.applyToTeam);
teamsRouter.get('/:id/applications', requireAuth, TeamsController.getTeamApplications);
teamsRouter.patch('/:id/applications/:appId', requireAuth, validateBody(updateApplicationStatusSchema), TeamsController.updateApplicationStatus);
