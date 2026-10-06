import { Response, NextFunction } from 'express';
import { AgreementsService } from './agreements.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

export class AgreementsController {
  static async selectStudent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const agreement = await AgreementsService.initiateAgreement(
        req.user._id.toString(),
        req.params.projectId,
        req.body.studentId,
        req.body.agreedAmountINR,
        req.body.paymentMethodNote
      );
      return res.status(200).json({
        success: true,
        data: { agreement },
      });
    } catch (error) {
      next(error);
    }
  }

  static async confirmAgreement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const result = await AgreementsService.confirmAgreement(req.user._id.toString(), req.params.id);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async confirmPaymentReceived(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const result = await AgreementsService.confirmPaymentReceived(
        req.user._id.toString(),
        req.params.projectId
      );
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getByProjectId(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const agreement = await AgreementsService.getByProjectId(req.params.projectId);
      return res.status(200).json({
        success: true,
        data: { agreement },
      });
    } catch (error) {
      next(error);
    }
  }
}
