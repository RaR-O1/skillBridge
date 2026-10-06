import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { featureFlags } from './config/featureFlags.js';

// Route imports
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { portfolioRouter } from './modules/portfolio/portfolio.routes.js';
import { teamsRouter } from './modules/teams/teams.routes.js';
import { projectsRouter } from './modules/projects/projects.routes.js';
import { agreementsRouter } from './modules/agreements/agreements.routes.js';
import { chatRouter } from './modules/chat/chat.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';
import { reportsRouter } from './modules/reports/reports.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';

// Phase 2 feature-flagged routes
import { jobsRouter } from './modules/jobs/jobs.routes.js';
import { startupsRouter } from './modules/startups/startups.routes.js';
import { mentorshipRouter } from './modules/mentorship/mentorship.routes.js';
import { recommendationsRouter } from './modules/recommendations/recommendations.routes.js';
import { aiRouter } from './modules/ai/ai.routes.js';

export const app = express();

// Security & Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    featureFlags,
  });
});

// Mount Module Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/agreements', agreementsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/admin', adminRouter);

// Phase 2 / AI feature flagged routes
app.use('/api/jobs', jobsRouter);
app.use('/api/startups', startupsRouter);
app.use('/api/mentorship', mentorshipRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/ai', aiRouter);

// 404 handler for undefined routes
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested API route does not exist.',
    },
  });
});

// Central Error Handler
app.use(errorHandler);
