import { Router } from 'express';
import { AgreementsController } from './agreements.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { selectStudentSchema, confirmAgreementSchema } from './agreements.validation.js';
import { requireAuth } from '../../middleware/auth.js';

export const agreementsRouter = Router();

agreementsRouter.get('/project/:projectId', requireAuth, AgreementsController.getByProjectId);
agreementsRouter.post('/select/:projectId', requireAuth, validateBody(selectStudentSchema), AgreementsController.selectStudent);
agreementsRouter.post('/:id/confirm', requireAuth, validateBody(confirmAgreementSchema), AgreementsController.confirmAgreement);
agreementsRouter.post('/confirm-payment/:projectId', requireAuth, AgreementsController.confirmPaymentReceived);
