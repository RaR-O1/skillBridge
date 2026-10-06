import { Response, NextFunction } from 'express';
import { PortfolioService } from './portfolio.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

export class PortfolioController {
  static async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const item = await PortfolioService.addItem(req.user._id.toString(), req.body);
      return res.status(201).json({
        success: true,
        data: { item },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const updated = await PortfolioService.updateItem(req.user._id.toString(), req.params.id, req.body);
      return res.status(200).json({
        success: true,
        data: { item: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      await PortfolioService.deleteItem(req.user._id.toString(), req.params.id);
      return res.status(200).json({
        success: true,
        data: { message: 'Portfolio item deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyPortfolio(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const items = await PortfolioService.getUserPortfolio(req.user._id.toString());
      return res.status(200).json({
        success: true,
        data: { items },
      });
    } catch (error) {
      next(error);
    }
  }

  static async createReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const review = await PortfolioService.createReview(req.user._id.toString(), req.body);
      return res.status(201).json({
        success: true,
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  }
}
