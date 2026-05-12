import { Router } from 'express';
import { param } from 'express-validator';
import { listNotifications, markNotificationRead } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';

export const notificationRouter = Router();

notificationRouter.get('/', authenticate, listNotifications);
notificationRouter.patch('/:id/read', authenticate, [param('id').isMongoId()], validateRequest, markNotificationRead);
