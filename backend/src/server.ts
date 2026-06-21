import app from './app';
import { connectDB } from './config/db';
import { config } from './config/env';
import { logger } from './config/logger';
import { initCronJobs } from './utils/cronJobs';

const startServer = async () => {
  try {
    await connectDB();
    initCronJobs();
    app.listen(config.port, () => {
      logger.info(`WorkSphere HRMS Server running in ${config.nodeEnv} mode on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
