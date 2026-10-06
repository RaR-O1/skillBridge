import { User, IUser } from '../users/users.model.js';
import { Project } from '../projects/projects.model.js';
import { Team } from '../teams/teams.model.js';
import { Report } from '../reports/reports.model.js';
import { AuditLog, IAuditLog } from './admin.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { logAdminAction } from '../../middleware/auditLogger.js';
import { NotificationService } from '../notifications/notifications.service.js';

export class AdminService {
  static async getVerificationQueue(): Promise<{ students: IUser[]; businesses: IUser[] }> {
    const students = await User.find({
      role: 'student',
      collegeEmail: { $exists: true, $ne: '' },
      collegeVerified: false,
    }).limit(50);

    const businesses = await User.find({
      role: { $in: ['local_business', 'company', 'startup'] },
      businessVerified: false,
    }).limit(50);

    return { students, businesses };
  }

  static async verifyUser(
    adminId: string,
    adminEmail: string,
    userId: string,
    type: 'college' | 'business',
    approved: boolean,
    reason?: string
  ): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    if (type === 'college') {
      user.collegeVerified = approved;
      if (approved) {
        user.trustScore = Math.min(100, user.trustScore + 10);
      }
    } else if (type === 'business') {
      user.businessVerified = approved;
      if (approved) {
        user.trustScore = Math.min(100, user.trustScore + 10);
      }
    }

    await user.save();

    await logAdminAction({
      adminId,
      adminEmail,
      action: approved ? `VERIFY_${type.toUpperCase()}_APPROVED` : `VERIFY_${type.toUpperCase()}_REJECTED`,
      targetType: 'User',
      targetId: user._id.toString(),
      details: { approved, type, reason },
    });

    await NotificationService.send({
      userId: user._id.toString(),
      title: approved ? 'Verification Approved!' : 'Verification Update',
      message: approved
        ? `Your ${type} verification was approved! You now have a verified badge.`
        : `Your ${type} verification could not be approved. Reason: ${reason || 'Please provide official documentation.'}`,
      type: 'verification_update',
    });

    return user;
  }

  static async moderateUser(
    adminId: string,
    adminEmail: string,
    userId: string,
    action: 'warn' | 'suspend' | 'ban' | 'reactivate',
    reason: string
  ): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    if (user.role === 'admin') {
      throw new AppError('Cannot perform moderation action on an administrator', 403, 'FORBIDDEN');
    }

    if (action === 'warn') {
      user.status = 'warned';
      user.trustScore = Math.max(0, user.trustScore - 20);
    } else if (action === 'suspend') {
      user.status = 'suspended';
    } else if (action === 'ban') {
      user.status = 'banned';
    } else if (action === 'reactivate') {
      user.status = 'active';
    }

    await user.save();

    await logAdminAction({
      adminId,
      adminEmail,
      action: `USER_${action.toUpperCase()}`,
      targetType: 'User',
      targetId: user._id.toString(),
      details: { reason },
    });

    await NotificationService.send({
      userId: user._id.toString(),
      title: `Account Status: ${action.toUpperCase()}`,
      message: `Your account status was set to ${action}. Details: ${reason}`,
      type: 'account_moderation',
    });

    return user;
  }

  static async getAuditLogs(limit = 100): Promise<IAuditLog[]> {
    return await AuditLog.find().sort({ createdAt: -1 }).limit(limit);
  }

  static async getPlatformMetrics() {
    const [
      totalUsers,
      studentsCount,
      verifiedStudents,
      businessCount,
      totalProjects,
      completedProjects,
      totalTeams,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', collegeVerified: true }),
      User.countDocuments({ role: { $in: ['local_business', 'company', 'startup'] } }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'completed' }),
      Team.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
    ]);

    return {
      users: {
        total: totalUsers,
        students: studentsCount,
        verifiedStudents,
        businesses: businessCount,
      },
      projects: {
        total: totalProjects,
        completed: completedProjects,
      },
      teams: {
        total: totalTeams,
      },
      reports: {
        pending: pendingReports,
      },
    };
  }
}
