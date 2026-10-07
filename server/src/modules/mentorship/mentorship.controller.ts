import { Response, NextFunction } from 'express';
import { MentorshipService } from './mentorship.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';

export class MentorshipController {
  // Profiles
  static async upsertMentorProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const profile = await MentorshipService.upsertMentorProfile(
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

  static async listMentors(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const mentors = await MentorshipService.listMentors(req.query as any);
      return res.status(200).json({
        success: true,
        data: { mentors },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMentorById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const mentor = await MentorshipService.getMentorById(req.params.id);
      return res.status(200).json({
        success: true,
        data: { mentor },
      });
    } catch (error) {
      next(error);
    }
  }

  // Sessions
  static async requestSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const session = await MentorshipService.requestSession(
        req.user._id.toString(),
        req.params.mentorId,
        req.body
      );
      return res.status(201).json({
        success: true,
        data: { session },
      });
    } catch (error) {
      next(error);
    }
  }

  static async proposeTimes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const session = await MentorshipService.proposeTimes(
        req.user._id.toString(),
        req.params.sessionId,
        req.body.proposedTimes
      );
      return res.status(200).json({
        success: true,
        data: { session },
      });
    } catch (error) {
      next(error);
    }
  }

  static async confirmSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const session = await MentorshipService.confirmSession(
        req.user._id.toString(),
        req.params.sessionId,
        req.body.confirmedTime,
        req.body.meetingLink
      );
      return res.status(200).json({
        success: true,
        data: { session },
      });
    } catch (error) {
      next(error);
    }
  }

  static async submitFeedback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const session = await MentorshipService.submitFeedback(
        req.user._id.toString(),
        req.params.sessionId,
        req.body.rating,
        req.body.review
      );
      return res.status(200).json({
        success: true,
        data: { session },
      });
    } catch (error) {
      next(error);
    }
  }

  static async listMySessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const sessions = await MentorshipService.listSessions(req.user._id.toString());
      return res.status(200).json({
        success: true,
        data: { sessions },
      });
    } catch (error) {
      next(error);
    }
  }

  // Resources
  static async listResources(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const resources = await MentorshipService.listResources(
        req.query.category as string,
        req.query.tag as string
      );
      return res.status(200).json({
        success: true,
        data: { resources },
      });
    } catch (error) {
      next(error);
    }
  }

  static async createResource(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const resource = await MentorshipService.createResource(req.user._id.toString(), req.body);
      return res.status(201).json({
        success: true,
        data: { resource },
      });
    } catch (error) {
      next(error);
    }
  }

  // Referrals
  static async requestReferral(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const referral = await MentorshipService.requestReferral(req.user._id.toString(), req.body);
      return res.status(201).json({
        success: true,
        data: { referral },
      });
    } catch (error) {
      next(error);
    }
  }

  static async listMyReferrals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const referrals = await MentorshipService.listReferrals(req.user._id.toString());
      return res.status(200).json({
        success: true,
        data: { referrals },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateReferralStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const referral = await MentorshipService.updateReferral(
        req.user._id.toString(),
        req.params.referralId,
        req.body.status,
        req.body.feedback
      );
      return res.status(200).json({
        success: true,
        data: { referral },
      });
    } catch (error) {
      next(error);
    }
  }
}
