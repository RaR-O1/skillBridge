import { Response, NextFunction } from 'express';
import { AiService } from './ai.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

export class AiController {
  static async getProfileFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const feedback = await AiService.getProfileFeedback(req.user._id.toString());
      return res.status(200).json({
        success: true,
        data: { feedback },
      });
    } catch (error) {
      next(error);
    }
  }

  static async generateProjectScope(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { prompt, category, targetTimelineWeeks } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        throw new AppError('Prompt description is required', 400);
      }

      const scope = AiService.generateProjectScope({
        prompt,
        category,
        targetTimelineWeeks: Number(targetTimelineWeeks),
      });

      return res.status(200).json({
        success: true,
        data: { scope },
      });
    } catch (error) {
      next(error);
    }
  }

  static async generateChatSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { roomId } = req.params;
      const summary = await AiService.generateChatSummary(roomId, req.user._id.toString());
      return res.status(200).json({
        success: true,
        data: { summary },
      });
    } catch (error) {
      next(error);
    }
  }
}
