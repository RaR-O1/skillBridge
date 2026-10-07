import { Response, NextFunction } from 'express';
import { AdminService } from './admin.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

export class AdminController {
  static async getVerificationQueue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const queue = await AdminService.getVerificationQueue();
      return res.status(200).json({
        success: true,
        data: queue,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const company = await AdminService.verifyCompany(
        req.user._id.toString(),
        req.user.email,
        req.params.companyId,
        req.body.approved !== false
      );
      return res.status(200).json({
        success: true,
        data: { company },
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const user = await AdminService.verifyUser(
        req.user._id.toString(),
        req.user.email,
        req.params.userId,
        req.body.type,
        req.body.approved,
        req.body.reason
      );
      return res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  static async moderateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const user = await AdminService.moderateUser(
        req.user._id.toString(),
        req.user.email,
        req.params.userId,
        req.body.action,
        req.body.reason
      );
      return res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const logs = await AdminService.getAuditLogs(limit);
      return res.status(200).json({
        success: true,
        data: { logs },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPlatformMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await AdminService.getPlatformMetrics();
      return res.status(200).json({
        success: true,
        data: { metrics },
      });
    } catch (error) {
      next(error);
    }
  }
}
