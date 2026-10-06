import { Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

export class AuthController {
  static async onboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const authUid = req.authUid || req.body.uid || `user-${Date.now()}`;
      const email = req.authEmail || req.body.email;

      if (!email) {
        throw new AppError('Email is required for onboarding.', 400, 'EMAIL_REQUIRED');
      }

      const result = await AuthService.onboardUser(authUid, email, req.body);
      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async devLogin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, role, name } = req.body;
      const result = await AuthService.devLogin(email, role, name);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const user = await AuthService.getMe(req.user._id.toString());
      return res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendCollegeVerification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const result = await AuthService.sendCollegeVerification(req.user._id.toString(), req.body.collegeEmail);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyCollegeEmail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const user = await AuthService.verifyCollegeEmail(
        req.user._id.toString(),
        req.body.collegeEmail,
        req.body.code
      );
      return res.status(200).json({
        success: true,
        data: {
          user,
          message: 'College email successfully verified! Verified badge unlocked.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
