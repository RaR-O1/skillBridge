import { Response, NextFunction } from 'express';
import { StartupsService } from './startups.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

export class StartupsController {
  static async createStartup(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const startup = await StartupsService.createStartup(req.user._id.toString(), req.body);
      return res.status(201).json({
        success: true,
        data: { startup },
      });
    } catch (error) {
      next(error);
    }
  }

  static async listStartups(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const startups = await StartupsService.listStartups(req.query as any);
      return res.status(200).json({
        success: true,
        data: { startups },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStartupById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const startup = await StartupsService.getStartupById(req.params.id);
      return res.status(200).json({
        success: true,
        data: { startup },
      });
    } catch (error) {
      next(error);
    }
  }

  static async addRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const startup = await StartupsService.addRole(
        req.user._id.toString(),
        req.params.id,
        req.body
      );
      return res.status(201).json({
        success: true,
        data: { startup },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateRoleStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const startup = await StartupsService.updateRoleStatus(
        req.user._id.toString(),
        req.params.id,
        req.params.roleId,
        req.body.status
      );
      return res.status(200).json({
        success: true,
        data: { startup },
      });
    } catch (error) {
      next(error);
    }
  }

  static async applyToRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const application = await StartupsService.applyToRole(
        req.user._id.toString(),
        req.params.id,
        req.params.roleId,
        req.body.coverLetter
      );
      return res.status(201).json({
        success: true,
        data: { application },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStartupApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const applications = await StartupsService.getStartupApplications(
        req.user._id.toString(),
        req.params.id
      );
      return res.status(200).json({
        success: true,
        data: { applications },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateApplicationStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const application = await StartupsService.updateApplicationStatus(
        req.user._id.toString(),
        req.params.appId,
        req.body.status
      );
      return res.status(200).json({
        success: true,
        data: { application },
      });
    } catch (error) {
      next(error);
    }
  }

  // Co-Founder endpoints
  static async upsertCoFounderProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const profile = await StartupsService.upsertCoFounderProfile(
        req.user._id.toString(),
        req.body
      );
      return res.status(200).json({
        success: true,
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }

  static async listCoFounders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const coFounders = await StartupsService.listCoFounders(req.query as any);
      return res.status(200).json({
        success: true,
        data: { coFounders },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyCoFounderProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const profile = await StartupsService.getCoFounderProfile(req.user._id.toString());
      return res.status(200).json({
        success: true,
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }
}
