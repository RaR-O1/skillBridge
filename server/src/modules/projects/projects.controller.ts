import { Response, NextFunction } from 'express';
import { ProjectsService } from './projects.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

export class ProjectsController {
  static async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const project = await ProjectsService.createProject(req.user._id.toString(), req.body);
      return res.status(201).json({
        success: true,
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  static async listProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectsService.listProjects(req.query as any);
      return res.status(200).json({
        success: true,
        data: { projects },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ProjectsService.getProjectById(req.params.id);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async applyToProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const application = await ProjectsService.applyToProject(
        req.user._id.toString(),
        req.params.id,
        req.body.proposedBudgetINR,
        req.body.coverNote
      );
      return res.status(201).json({
        success: true,
        data: { application },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProjectApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const applications = await ProjectsService.getProjectApplications(req.user._id.toString(), req.params.id);
      return res.status(200).json({
        success: true,
        data: { applications },
      });
    } catch (error) {
      next(error);
    }
  }

  static async submitDeliverable(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const project = await ProjectsService.submitDeliverable(
        req.user._id.toString(),
        req.params.id,
        req.body.workUrl,
        req.body.notes
      );
      return res.status(200).json({
        success: true,
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  static async approveDeliverable(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const project = await ProjectsService.approveDeliverable(req.user._id.toString(), req.params.id);
      return res.status(200).json({
        success: true,
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const project = await ProjectsService.cancelProject(
        req.user._id.toString(),
        req.params.id,
        req.body.reason
      );
      return res.status(200).json({
        success: true,
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }
}
