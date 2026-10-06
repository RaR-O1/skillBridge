import { Router, Response, NextFunction } from 'express';
import { ChatService } from './chat.service.js';
import { requireAuth, AuthenticatedRequest } from '../../middleware/auth.js';
import { messageLimiter } from '../../middleware/rateLimiter.js';
import { AppError } from '../../middleware/errorHandler.js';
import { getSocketServer } from '../../sockets/socketServer.js';
import { z } from 'zod';
import { validateBody } from '../../middleware/validate.js';

export const chatRouter = Router();

const sendMessageSchema = z.object({
  content: z.string().max(5000).optional().default(''),
  fileUrl: z.string().url().optional().or(z.literal('')),
  fileName: z.string().max(200).optional(),
});

chatRouter.get('/rooms/:roomId/messages', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const messages = await ChatService.getRoomMessages(req.user._id.toString(), req.params.roomId, limit);
    return res.status(200).json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
});

chatRouter.post('/rooms/:roomId/messages', requireAuth, messageLimiter, validateBody(sendMessageSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const message = await ChatService.saveMessage(
      req.user._id.toString(),
      req.params.roomId,
      req.body.content,
      req.body.fileUrl,
      req.body.fileName
    );

    // Also notify socket clients if available
    const io = getSocketServer();
    if (io) {
      io.to(req.params.roomId).emit('new_message', message);
    }

    return res.status(201).json({
      success: true,
      data: { message },
    });
  } catch (error) {
    next(error);
  }
});
