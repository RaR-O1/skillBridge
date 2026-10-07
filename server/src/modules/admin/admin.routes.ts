import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { verifyUserActionSchema, moderateUserSchema } from './admin.validation.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';

export const adminRouter = Router();

// All admin routes strictly require authentication and admin role
adminRouter.use(requireAuth);
adminRouter.use(requireRole('admin'));

adminRouter.get('/queue', AdminController.getVerificationQueue);
adminRouter.post('/verify/:userId', validateBody(verifyUserActionSchema), AdminController.verifyUser);
adminRouter.post('/verify-company/:companyId', AdminController.verifyCompany);
adminRouter.post('/users/:userId/moderate', validateBody(moderateUserSchema), AdminController.moderateUser);
adminRouter.get('/audit-logs', AdminController.getAuditLogs);
adminRouter.get('/metrics', AdminController.getPlatformMetrics);
