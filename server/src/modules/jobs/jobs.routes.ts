import { Router } from 'express';
import { JobsController } from './jobs.controller.js';
import { requireFeature } from '../../config/featureFlags.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { applyLimiter } from '../../middleware/rateLimiter.js';
import {
  createCompanySchema,
  createJobSchema,
  applyJobSchema,
  updateStageSchema,
  addNoteSchema,
  bulkUpdateStageSchema,
} from './jobs.validation.js';

export const jobsRouter = Router();

jobsRouter.use(requireFeature('jobsAndInternships'));

// Company routes
jobsRouter.get('/companies', optionalAuth, JobsController.listCompanies);
jobsRouter.get('/companies/:id', optionalAuth, JobsController.getCompanyById);
jobsRouter.post('/companies', requireAuth, validateBody(createCompanySchema), JobsController.createCompany);

// Student application tracking
jobsRouter.get('/applications/my', requireAuth, JobsController.getMyApplications);

// Job listings & postings
jobsRouter.get('/', optionalAuth, JobsController.listJobs);
jobsRouter.get('/:id', optionalAuth, JobsController.getJobById);
jobsRouter.post('/', requireAuth, validateBody(createJobSchema), JobsController.createJob);

// Applications & Recruiter Pipeline
jobsRouter.post('/:id/apply', requireAuth, applyLimiter, validateBody(applyJobSchema), JobsController.applyToJob);
jobsRouter.get('/:id/applications', requireAuth, JobsController.getJobApplications);
jobsRouter.patch('/applications/:appId/stage', requireAuth, validateBody(updateStageSchema), JobsController.updateApplicationStage);
jobsRouter.post('/applications/:appId/notes', requireAuth, validateBody(addNoteSchema), JobsController.addApplicationNote);
jobsRouter.post('/applications/bulk-stage', requireAuth, validateBody(bulkUpdateStageSchema), JobsController.bulkUpdateStage);
