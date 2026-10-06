import mongoose from 'mongoose';
import { Message, IMessage } from './chat.model.js';
import { Team } from '../teams/teams.model.js';
import { Project } from '../projects/projects.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class ChatService {
  static async validateRoomAccess(userId: string, roomId: string): Promise<boolean> {
    if (roomId.startsWith('team_')) {
      const teamId = roomId.replace('team_', '');
      if (mongoose.Types.ObjectId.isValid(teamId)) {
        const team = await Team.findById(teamId);
        if (!team) return false;
        return (
          team.ownerId.toString() === userId ||
          team.members.some((m) => m.toString() === userId)
        );
      }
    } else if (roomId.startsWith('project_')) {
      const projectId = roomId.replace('project_', '');
      if (mongoose.Types.ObjectId.isValid(projectId)) {
        const project = await Project.findById(projectId);
        if (!project) return false;
        return (
          project.ownerId.toString() === userId ||
          project.assignedStudentId?.toString() === userId
        );
      }
    } else if (roomId.startsWith('dm_')) {
      // Direct message room e.g. dm_<userA>_<userB>
      const parts = roomId.replace('dm_', '').split('_');
      return parts.includes(userId);
    }
    // Default open for generic rooms or admin
    return true;
  }

  static async saveMessage(
    senderId: string,
    roomId: string,
    content: string,
    fileUrl?: string,
    fileName?: string
  ): Promise<IMessage> {
    const hasAccess = await this.validateRoomAccess(senderId, roomId);
    if (!hasAccess) {
      throw new AppError('Forbidden: You do not have permission to post in this room', 403, 'ROOM_FORBIDDEN');
    }

    if (!content && !fileUrl) {
      throw new AppError('Message must contain text content or a file URL', 400, 'EMPTY_MESSAGE');
    }

    const message = new Message({
      roomId,
      senderId: new mongoose.Types.ObjectId(senderId),
      content: content || '',
      fileUrl,
      fileName,
    });

    const saved = await message.save();
    return await saved.populate('senderId', 'name avatarUrl college role');
  }

  static async getRoomMessages(userId: string, roomId: string, limit = 50): Promise<IMessage[]> {
    const hasAccess = await this.validateRoomAccess(userId, roomId);
    if (!hasAccess) {
      throw new AppError('Forbidden: You do not have access to this room', 403, 'ROOM_FORBIDDEN');
    }

    return await Message.find({ roomId })
      .populate('senderId', 'name avatarUrl college role')
      .sort({ createdAt: 1 })
      .limit(limit);
  }
}
