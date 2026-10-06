import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import { env } from './env.js';
import { logger } from './logger.js';

let firebaseInitialized = false;

if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    firebaseInitialized = true;
    logger.info('Firebase Admin SDK initialized successfully');
  } catch (err) {
    logger.error({ err }, 'Error initializing Firebase Admin SDK');
  }
} else {
  logger.warn('Firebase credentials not provided. Using development JWT/token verification strategy.');
}

export async function verifyAuthToken(token: string): Promise<{ uid: string; email?: string; email_verified?: boolean }> {
  if (firebaseInitialized) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email,
        email_verified: decoded.email_verified,
      };
    } catch (err) {
      logger.warn({ err }, 'Firebase token verification failed. Checking fallback dev token...');
    }
  }

  // Fallback JWT verification for dev/test mode
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    return {
      uid: decoded.uid || decoded.sub || decoded.id,
      email: decoded.email,
      email_verified: decoded.email_verified ?? true,
    };
  } catch (err) {
    throw new Error('Invalid or expired authentication token');
  }
}

export function generateDevToken(payload: { uid: string; email?: string; role?: string }): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}
