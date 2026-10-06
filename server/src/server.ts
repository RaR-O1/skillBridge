import { createServer } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/database.js';
import { logger } from './config/logger.js';
import { initSocketServer } from './sockets/socketServer.js';

async function bootstrap() {
  try {
    await connectDB();

    const httpServer = createServer(app);
    initSocketServer(httpServer);

    const port = env.PORT || 5000;
    httpServer.listen(port, () => {
      logger.info(`SkillBridge server listening on http://localhost:${port}`);
    });

    const shutdown = async () => {
      logger.info('Shutting down server gracefully...');
      httpServer.close(async () => {
        await disconnectDB();
        logger.info('Server and database connections terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error({ error }, 'Fatal error during server bootstrap');
    process.exit(1);
  }
}

bootstrap();
