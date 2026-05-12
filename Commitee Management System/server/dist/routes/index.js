import { Router } from 'express';
import { adminRouter } from './admin.routes.js';
import { authRouter } from './auth.routes.js';
import { committeeRouter } from './committee.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import { memberRouter } from './member.routes.js';
import { notificationRouter } from './notification.routes.js';
import { paymentRouter } from './payment.routes.js';
import { reportRouter } from './report.routes.js';
import { settingsRouter } from './settings.routes.js';
import { transactionRouter } from './transaction.routes.js';
export const apiRouter = Router();
apiRouter.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Committee Management API is healthy',
        timestamp: new Date().toISOString(),
    });
});
apiRouter.use('/auth', authRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/committees', committeeRouter);
apiRouter.use('/members', memberRouter);
apiRouter.use('/payments', paymentRouter);
apiRouter.use('/transactions', transactionRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/reports', reportRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/admin', adminRouter);
