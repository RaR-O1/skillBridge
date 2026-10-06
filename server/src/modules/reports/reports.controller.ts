import { Response, NextFunction } from 'express';
import { ReportsService } from './reports.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

export class ReportsController {
  static async createReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const report = await ReportsService.createReport(req.user._id.toString(), req.body);
      return res.status(201).json({
        success: true,
        data: { report, message: 'Report submitted successfully. Our safety team will review it.' },
      });
    } catch (error) {
      next(error);
    }
  }

  static async listReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const reports = await ReportsService.listReports(req.query as any);
      return res.status(200).json({
        success: true,
        data: { reports },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateReportStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const report = await ReportsService.updateReportStatus(
        req.user._id.toString(),
        req.user.email,
        req.params.id,
        req.body
      );
      return res.status(200).json({
        success: true,
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  }
}
