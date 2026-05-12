import { Router } from 'express';
import { body } from 'express-validator';
import { generateReport, listReports } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
export const reportRouter = Router();
reportRouter.get('/', authenticate, listReports);
reportRouter.post('/generate', authenticate, authorize('super_admin', 'admin', 'manager'), [
    body('type').isIn(['monthly', 'committee', 'financial', 'custom']),
    body('format').isIn(['pdf', 'xlsx']),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('committeeId').optional().isMongoId(),
], validateRequest, generateReport);
