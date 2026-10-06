import { Request, Response, NextFunction } from 'express';
import { verifyAuthToken } from '../config/firebase.js';
import { User, IUser } from '../modules/users/users.model.js';
import { AppError } from './errorHandler.js';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  authUid?: string;
  authEmail?: string;
}

export async function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing Bearer token.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split('Bearer ')[1].trim();
    if (!token) {
      throw new AppError('Invalid token format.', 401, 'UNAUTHORIZED');
    }

    const decoded = await verifyAuthToken(token);
    req.authUid = decoded.uid;
    req.authEmail = decoded.email;

    const user = await User.findOne({ uid: decoded.uid });
    if (!user) {
      throw new AppError('User profile not found. Please complete onboarding.', 401, 'USER_NOT_ONBOARDED');
    }

    if (user.status === 'banned') {
      throw new AppError('Account is banned due to policy violations.', 403, 'ACCOUNT_BANNED');
    }

    if (user.status === 'suspended') {
      throw new AppError('Account is temporarily suspended.', 403, 'ACCOUNT_SUSPENDED');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1].trim();
      if (token) {
        try {
          const decoded = await verifyAuthToken(token);
          req.authUid = decoded.uid;
          req.authEmail = decoded.email;
          const user = await User.findOne({ uid: decoded.uid });
          if (user && user.status !== 'banned') {
            req.user = user;
          }
        } catch {
          // Ignore invalid optional tokens
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}
