import { Response, NextFunction } from 'express';
import { RecommendationsService } from './recommendations.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

export class RecommendationsController {
  static async getRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);

      let results;
      if (req.user.role === 'student') {
        results = await RecommendationsService.recommendOpportunitiesForStudent(
          req.user._id.toString(),
          Number(req.query.limit) || 10
        );
      } else {
        // Business, recruiter or founder requesting talent recommendations
        const requiredSkills = req.query.skills
          ? String(req.query.skills).split(',').map((s) => s.trim())
          : ['React', 'Node.js'];
        const title = String(req.query.title || 'Engineering Role');
        const description = String(req.query.description || 'Developer for campus project');

        results = await RecommendationsService.recommendTalent(
          req.user._id.toString(),
          { requiredSkills, title, description },
          Number(req.query.limit) || 10
        );
      }

      return res.status(200).json({
        success: true,
        data: { recommendations: results },
      });
    } catch (error) {
      next(error);
    }
  }

  static async recordFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { entityId, entityType, action } = req.body;

      if (!entityId || !entityType || !action) {
        throw new AppError('entityId, entityType, and action are required', 400);
      }

      const feedback = await RecommendationsService.recordFeedback(
        req.user._id.toString(),
        entityId,
        entityType,
        action
      );

      return res.status(200).json({
        success: true,
        data: { feedback },
      });
    } catch (error) {
      next(error);
    }
  }
}
