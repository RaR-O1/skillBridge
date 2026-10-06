import { AuditLog } from '../modules/admin/admin.model.js';
import { logger } from '../config/logger.js';

export async function logAdminAction(params: {
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, any>;
  ipAddress?: string;
}) {
  try {
    await AuditLog.create(params);
    logger.info({ action: params.action, targetId: params.targetId, adminId: params.adminId }, 'Admin audit log recorded');
  } catch (err) {
    logger.error({ err }, 'Failed to record admin audit log');
  }
}
