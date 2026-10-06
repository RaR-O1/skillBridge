import { Router } from 'express';
import { ReportsController } from './reports.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { createReportSchema, updateReportStatusSchema } from './reports.validation.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

export const reportsRouter = Router();

// Any authenticated user can submit a report
reportsRouter.post('/', requireAuth, validateBody(createReportSchema), ReportsController.createReport);

// Only admins can view and resolve reports
reportsRouter.get('/', requireAuth, requireRole('admin'), ReportsController.listReports);
reportsRouter.patch('/:id/status', requireAuth, requireRole('admin'), validateBody(updateReportStatusSchema), ReportsController.updateReportStatus);
