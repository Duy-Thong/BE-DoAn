import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.js';
import { NotificationController } from './controller.js';

export const notificationsRouter = Router();
const controller = new NotificationController();

notificationsRouter.use(authMiddleware);

// Notification CRUD routes
notificationsRouter.post('/', controller.create.bind(controller));
notificationsRouter.get('/', controller.list.bind(controller));
notificationsRouter.get('/stats', controller.getStats.bind(controller));
notificationsRouter.get('/unread-count', controller.getUnreadCount.bind(controller));
notificationsRouter.get('/:id', controller.getById.bind(controller));
notificationsRouter.put('/:id', controller.update.bind(controller));
notificationsRouter.delete('/:id', controller.remove.bind(controller));

// Mark as read routes
notificationsRouter.patch('/:id/read', controller.markAsRead.bind(controller));
notificationsRouter.patch('/bulk-read', controller.bulkMarkAsRead.bind(controller));
notificationsRouter.patch('/read-all', controller.markAllAsRead.bind(controller));

// Cleanup routes
notificationsRouter.delete('/cleanup/old', controller.deleteOld.bind(controller));
