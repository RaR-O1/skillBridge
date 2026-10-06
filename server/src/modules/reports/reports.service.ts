import mongoose from 'mongoose';
import { Report, IReport, ReportStatus } from './reports.model.js';
import { User } from '../users/users.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { logAdminAction } from '../../middleware/auditLogger.js';
import { NotificationService } from '../notifications/notifications.service.js';

export class ReportsService {
  static async createReport(
    reporterId: string,
    data: {
      category: 'payment_not_received' | 'spam' | 'harassment' | 'fraud' | 'other';
      description: string;
      targetUserId?: string;
      projectId?: string;
      chatRoomId?: string;
      evidenceUrl?: string;
    }
  ): Promise<IReport> {
    const report = new Report({
      reporterId: new mongoose.Types.ObjectId(reporterId),
      targetUserId: data.targetUserId ? new mongoose.Types.ObjectId(data.targetUserId) : undefined,
      projectId: data.projectId ? new mongoose.Types.ObjectId(data.projectId) : undefined,
      chatRoomId: data.chatRoomId,
      category: data.category,
      description: data.description,
      evidenceUrl: data.evidenceUrl,
      status: 'pending',
    });

    return await report.save();
  }

  static async listReports(filters: { status?: string; category?: string }): Promise<IReport[]> {
    const query: any = {};
    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;

    return await Report.find(query)
      .populate('reporterId', 'name email role')
      .populate('targetUserId', 'name email role trustScore status')
      .populate('projectId', 'title budgetINR status')
      .sort({ createdAt: -1 });
  }

  static async updateReportStatus(
    adminId: string,
    adminEmail: string,
    reportId: string,
    data: {
      status: ReportStatus;
      resolutionNotes?: string;
      actionToTake?: 'none' | 'warn' | 'suspend' | 'ban';
    }
  ): Promise<IReport> {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new AppError('Report not found', 404, 'NOT_FOUND');
    }

    report.status = data.status;
    if (data.resolutionNotes) report.resolutionNotes = data.resolutionNotes;
    report.resolvedBy = new mongoose.Types.ObjectId(adminId);
    report.resolvedAt = new Date();

    await report.save();

    // Execute moderation action if specified
    if (data.actionToTake && data.actionToTake !== 'none' && report.targetUserId) {
      const targetUser = await User.findById(report.targetUserId);
      if (targetUser) {
        if (data.actionToTake === 'warn') {
          targetUser.status = 'warned';
          targetUser.trustScore = Math.max(0, targetUser.trustScore - 20);
          await targetUser.save();
          await NotificationService.send({
            userId: targetUser._id.toString(),
            title: 'Policy Violation Warning',
            message: `You have received a formal warning regarding report #${report._id}: ${data.resolutionNotes || 'Please adhere to platform terms.'}`,
            type: 'warning',
          });
        } else if (data.actionToTake === 'suspend') {
          targetUser.status = 'suspended';
          await targetUser.save();
        } else if (data.actionToTake === 'ban') {
          targetUser.status = 'banned';
          await targetUser.save();
        }

        await logAdminAction({
          adminId,
          adminEmail,
          action: `USER_${data.actionToTake.toUpperCase()}`,
          targetType: 'User',
          targetId: targetUser._id.toString(),
          details: { reportId: report._id.toString(), reason: data.resolutionNotes },
        });
      }
    }

    // Record audit log for report resolution
    await logAdminAction({
      adminId,
      adminEmail,
      action: 'RESOLVE_REPORT',
      targetType: 'Report',
      targetId: report._id.toString(),
      details: { status: data.status, notes: data.resolutionNotes, actionTaken: data.actionToTake },
    });

    return report;
  }
}
