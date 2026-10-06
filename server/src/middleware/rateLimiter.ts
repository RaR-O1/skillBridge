import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const applyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 40, // 40 applications per hour
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_APPLICATIONS',
      message: 'Too many applications submitted recently. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 messages per minute
  message: {
    success: false,
    error: {
      code: 'MESSAGE_RATE_LIMIT',
      message: 'Sending messages too rapidly. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 AI requests per minute
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMIT',
      message: 'AI usage rate limit reached. Please wait a moment.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
