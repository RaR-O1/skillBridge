import { Response, NextFunction } from 'express';
import { TeamsService } from './teams.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

export class TeamsController {
  static async createTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const team = await TeamsService.createTeam(req.user._id.toString(), req.body);
      return res.status(201).json({
        success: true,
        data: { team },
      });
    } catch (error) {
      next(error);
    }
  }

  static async listTeams(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const teams = await TeamsService.listTeams(req.query as any);
      return res.status(200).json({
        success: true,
        data: { teams },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTeamById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const team = await TeamsService.getTeamById(req.params.id);
      return res.status(200).json({
        success: true,
        data: { team },
      });
    } catch (error) {
      next(error);
    }
  }

  static async applyToTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const application = await TeamsService.applyToTeam(req.user._id.toString(), req.params.id, req.body.note);
      return res.status(201).json({
        success: true,
        data: { application },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTeamApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const applications = await TeamsService.getTeamApplications(req.user._id.toString(), req.params.id);
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
      const application = await TeamsService.updateApplicationStatus(
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
}
