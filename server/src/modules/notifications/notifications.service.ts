import mongoose from 'mongoose';
import { Notification, INotification } from './notifications.model.js';
import { getSocketServer } from '../../sockets/socketServer.js';

export class NotificationService {
  static async send(params: {
    userId: string;
    title: string;
    message: string;
    type: string;
    entityId?: string;
  }): Promise<INotification> {
    const notification = new Notification({
      userId: new mongoose.Types.ObjectId(params.userId),
      title: params.title,
      message: params.message,
      type: params.type,
      entityId: params.entityId,
      read: false,
    });

    const saved = await notification.save();

    // Real-time broadcast via Socket.io if active
    const io = getSocketServer();
    if (io) {
      io.to(`user_${params.userId}`).emit('new_notification', saved);
    }

    return saved;
  }

  static async getUserNotifications(userId: string, unreadOnly = false): Promise<INotification[]> {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (unreadOnly) {
      query.read = false;
    }
    return await Notification.find(query).sort({ createdAt: -1 }).limit(50);
  }

  static async markAsRead(userId: string, notificationId: string): Promise<INotification | null> {
    return await Notification.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(notificationId), userId: new mongoose.Types.ObjectId(userId) },
      { $set: { read: true } },
      { new: true }
    );
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), read: false },
      { $set: { read: true } }
    );
  }
}
