import express from 'express';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { applySecurityMiddleware } from './middleware/security.middleware.js';
import { apiRouter } from './routes/index.js';
export const createApp = () => {
    const app = express();
    applySecurityMiddleware(app);
    app.use('/api', apiRouter);
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
};
