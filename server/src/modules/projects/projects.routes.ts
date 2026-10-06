import { Router } from 'express';
import { ProjectsController } from './projects.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { createProjectSchema, applyProjectSchema, submitDeliverableSchema } from './projects.validation.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.js';
import { applyLimiter } from '../../middleware/rateLimiter.js';

export const projectsRouter = Router();

projectsRouter.get('/', optionalAuth, ProjectsController.listProjects);
projectsRouter.get('/:id', optionalAuth, ProjectsController.getProjectById);
projectsRouter.post('/', requireAuth, validateBody(createProjectSchema), ProjectsController.createProject);
projectsRouter.post('/:id/apply', requireAuth, applyLimiter, validateBody(applyProjectSchema), ProjectsController.applyToProject);
projectsRouter.get('/:id/applications', requireAuth, ProjectsController.getProjectApplications);
projectsRouter.post('/:id/submit', requireAuth, validateBody(submitDeliverableSchema), ProjectsController.submitDeliverable);
projectsRouter.post('/:id/approve', requireAuth, ProjectsController.approveDeliverable);
projectsRouter.post('/:id/cancel', requireAuth, ProjectsController.cancelProject);
