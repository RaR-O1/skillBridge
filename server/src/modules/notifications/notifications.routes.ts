import { Router } from 'express';
import { NotificationsController } from './notifications.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', requireAuth, NotificationsController.getNotifications);
notificationsRouter.patch('/:id/read', requireAuth, NotificationsController.markAsRead);
notificationsRouter.post('/read-all', requireAuth, NotificationsController.markAllAsRead);
