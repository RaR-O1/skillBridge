import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillbridge';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

async function bootstrapWorker() {
  console.log('[Worker] Initializing SkillBridge background worker...');

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('[Worker] Connected to MongoDB database.');
  } catch (err: any) {
    console.warn('[Worker] MongoDB direct connection unavailable in standalone worker. Worker running in light scheduler mode.');
  }

  // Redis & BullMQ initialization
  let redisConnection: any = null;
  let worker: Worker | null = null;

  try {
    redisConnection = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      connectTimeout: 2000,
    });

    redisConnection.on('error', (err: any) => {
      // Suppress spam if local redis is offline in dev
      if (err.code === 'ECONNREFUSED') {
        // Expected when running locally without redis-server
      }
    });

    worker = new Worker(
      'skillbridge-jobs',
      async (job) => {
        console.log(`[Worker] Processing job: ${job.name} (ID: ${job.id})`);

        if (job.name === 'auto-close-teams') {
          try {
            const Team = mongoose.models.Team;
            if (Team) {
              const res = await Team.updateMany(
                { status: 'open', deadline: { $lte: new Date() } },
                { $set: { status: 'closed' } }
              );
              console.log(`[Worker] Auto-closed ${res.modifiedCount} expired teams.`);
            }
          } catch (e: any) {
            console.error('[Worker] Error auto-closing teams:', e.message);
          }
        }
      },
      { connection: redisConnection }
    );

    console.log('[Worker] BullMQ Worker listening on queue "skillbridge-jobs".');
  } catch (redisErr: any) {
    console.warn('[Worker] Redis not detected. Fallback in-process interval timer activated.');
  }

  // Periodic fallback task: auto-close expired hackathon teams every 5 minutes
  setInterval(async () => {
    try {
      if (mongoose.connection.readyState === 1 && mongoose.models.Team) {
        const res = await mongoose.models.Team.updateMany(
          { status: 'open', deadline: { $lte: new Date() } },
          { $set: { status: 'closed' } }
        );
        if (res.modifiedCount > 0) {
          console.log(`[Worker Periodic] Auto-closed ${res.modifiedCount} expired teams.`);
        }
      }
    } catch {
      // Silent in periodic check
    }
  }, 5 * 60 * 1000);

  console.log('[Worker] SkillBridge background worker ready.');
}

bootstrapWorker();
