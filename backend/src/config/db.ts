import mongoose from 'mongoose';
import { config } from './env';
import { logger } from './logger';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodbUri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};
