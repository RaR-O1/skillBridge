import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

let mongod: any = null;

export async function connectDB(): Promise<typeof mongoose> {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose;
    }

    // Try connecting to provided MONGODB_URI
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    logger.info(`Connected to MongoDB at ${env.MONGODB_URI}`);
    return mongoose;
  } catch (err: any) {
    if (env.NODE_ENV !== 'production') {
      logger.warn(`Could not connect to ${env.MONGODB_URI}. Initializing in-memory MongoDB for local/test development...`);
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongod = await MongoMemoryServer.create({
          instance: {
            launchTimeout: 120000,
          },
        });
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        logger.info(`Connected to in-memory MongoDB server at ${uri}`);
        return mongoose;
      } catch (memErr) {
        logger.error({ err: memErr }, 'Failed to start in-memory MongoDB server');
        throw memErr;
      }
    } else {
      logger.error({ err }, 'Failed to connect to production MongoDB');
      throw err;
    }
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}
