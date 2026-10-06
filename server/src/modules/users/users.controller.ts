import { Response, NextFunction } from 'express';
import { UsersService } from './users.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

export class UsersController {
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const updated = await UsersService.updateProfile(req.user._id.toString(), req.body);
      return res.status(200).json({
        success: true,
        data: { user: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPublicProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const profile = await UsersService.getPublicProfile(req.params.idOrUid);
      return res.status(200).json({
        success: true,
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }

  static async searchTalent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const results = await UsersService.searchTalent(req.query as any);
      return res.status(200).json({
        success: true,
        data: { talent: results },
      });
    } catch (error) {
      next(error);
    }
  }
}
