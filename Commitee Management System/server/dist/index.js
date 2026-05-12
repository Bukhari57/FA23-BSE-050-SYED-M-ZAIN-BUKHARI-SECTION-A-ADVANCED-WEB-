import { createServer } from 'node:http';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { createApp } from './app.js';
import { initSocketServer } from './sockets/socket-server.js';
import { logger } from './utils/logger.js';
const bootstrap = async () => {
    await connectDatabase();
    const app = createApp();
    const server = createServer(app);
    initSocketServer(server);
    server.listen(env.port, () => {
        logger.info(`Server listening on port ${env.port}`);
    });
};
bootstrap().catch((error) => {
    logger.error('Failed to bootstrap server', error);
    process.exit(1);
});
