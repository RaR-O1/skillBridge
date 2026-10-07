import { Response, NextFunction } from 'express';
import { JobsService } from './jobs.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

export class JobsController {
  // Company
  static async createCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const company = await JobsService.createCompany(req.user._id.toString(), req.body);
      return res.status(201).json({
        success: true,
        data: { company },
      });
    } catch (error) {
      next(error);
    }
  }

  static async listCompanies(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companies = await JobsService.listCompanies();
      return res.status(200).json({
        success: true,
        data: { companies },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCompanyById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await JobsService.getCompanyById(req.params.id);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Jobs
  static async createJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const job = await JobsService.createJob(req.user._id.toString(), req.body);
      return res.status(201).json({
        success: true,
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  }

  static async listJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const jobs = await JobsService.listJobs(req.query as any);
      return res.status(200).json({
        success: true,
        data: { jobs },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getJobById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const job = await JobsService.getJobById(req.params.id);
      return res.status(200).json({
        success: true,
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  }

  // Applications & Pipeline
  static async applyToJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const application = await JobsService.applyToJob(
        req.user._id.toString(),
        req.params.id,
        req.body.note
      );
      return res.status(201).json({
        success: true,
        data: { application },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getJobApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const applications = await JobsService.getJobApplications(req.user._id.toString(), req.params.id);
      return res.status(200).json({
        success: true,
        data: { applications },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const applications = await JobsService.getMyApplications(req.user._id.toString());
      return res.status(200).json({
        success: true,
        data: { applications },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateApplicationStage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const application = await JobsService.updateApplicationStage(
        req.user._id.toString(),
        req.params.appId,
        req.body.stage
      );
      return res.status(200).json({
        success: true,
        data: { application },
      });
    } catch (error) {
      next(error);
    }
  }

  static async addApplicationNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const application = await JobsService.addApplicationNote(
        req.user._id.toString(),
        req.params.appId,
        req.body.text
      );
      return res.status(200).json({
        success: true,
        data: { application },
      });
    } catch (error) {
      next(error);
    }
  }

  static async bulkUpdateStage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const result = await JobsService.bulkUpdateStage(
        req.user._id.toString(),
        req.body.applicationIds,
        req.body.stage
      );
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
