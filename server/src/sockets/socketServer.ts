import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAuthToken } from '../config/firebase.js';
import { User } from '../modules/users/users.model.js';
import { ChatService } from '../modules/chat/chat.service.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket Auth Middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = await verifyAuthToken(token);
      const user = await User.findOne({ uid: decoded.uid });
      if (!user || user.status === 'banned') {
        return next(new Error('User unauthorized or banned'));
      }

      socket.data.user = user;
      next();
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Socket authentication failed');
      next(new Error('Socket authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    const userId = user._id.toString();

    // Auto-join user personal room for private notifications
    socket.join(`user_${userId}`);
    logger.info({ userId, name: user.name }, 'User connected to socket');

    // Join a team or project chat room
    socket.on('join_room', async ({ roomId }: { roomId: string }, callback?: (res: any) => void) => {
      try {
        const hasAccess = await ChatService.validateRoomAccess(userId, roomId);
        if (!hasAccess) {
          if (callback) callback({ error: 'Access denied to this chat room' });
          return;
        }

        socket.join(roomId);
        logger.debug({ userId, roomId }, 'User joined chat room');
        if (callback) callback({ success: true, roomId });
      } catch (err: any) {
        if (callback) callback({ error: err.message });
      }
    });

    // Leave a chat room
    socket.on('leave_room', ({ roomId }: { roomId: string }) => {
      socket.leave(roomId);
    });

    // Send a message
    socket.on('send_message', async (data: { roomId: string; content: string; fileUrl?: string; fileName?: string }, callback?: (res: any) => void) => {
      try {
        const savedMessage = await ChatService.saveMessage(
          userId,
          data.roomId,
          data.content,
          data.fileUrl,
          data.fileName
        );

        // Broadcast to everyone in the room (including sender)
        io?.to(data.roomId).emit('new_message', savedMessage);

        if (callback) callback({ success: true, message: savedMessage });
      } catch (err: any) {
        if (callback) callback({ error: err.message });
      }
    });

    // Typing indicator
    socket.on('typing', ({ roomId, isTyping }: { roomId: string; isTyping: boolean }) => {
      socket.to(roomId).emit('user_typing', {
        userId,
        name: user.name,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      logger.debug({ userId }, 'User disconnected from socket');
    });
  });

  return io;
}

export function getSocketServer(): SocketIOServer | null {
  return io;
}
