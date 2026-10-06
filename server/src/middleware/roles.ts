import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { UserRole } from '../modules/users/users.model.js';
import { AppError } from './errorHandler.js';

export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: requires one of [${roles.join(', ')}] role. Current role is '${req.user.role}'.`,
          403,
          'FORBIDDEN_ROLE'
        )
      );
    }

    next();
  };
}

export function requireCollegeVerified(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
  }

  if (req.user.role === 'student' && !req.user.collegeVerified) {
    return next(
      new AppError(
        'College email verification required to perform this action.',
        403,
        'COLLEGE_VERIFICATION_REQUIRED'
      )
    );
  }

  next();
}
