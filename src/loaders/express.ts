import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { notFound } from '../middlewares/notFound.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { usersRouter } from '../modules/users/routes.js';
import { companiesRouter } from '../modules/companies/routes.js';
import { jobsRouter } from '../modules/jobs/routes.js';
import { applicationsRouter } from '../modules/applications/routes.js';
import { authRouter } from '../modules/auth/routes.js';
import { savedJobsRouter } from '../modules/saved-jobs/routes.js';
import { jobAlertsRouter } from '../modules/job-alerts/routes.js';
import { searchRouter } from '../modules/search/routes.js';
import { uploadsRouter } from '../modules/uploads/routes.js';
// New modules
import cvsRouter from '../modules/cvs/routes.js';
import companyMembersRouter from '../modules/companies/members/routes.js';
import adminRouter from '../modules/admin/routes.js';
// Additional modules
import { notificationsRouter } from '../modules/notifications/routes.js';
import { reviewsRouter } from '../modules/reviews/routes.js';
import aiRouter from '../modules/ai/routes.js';

export function createExpressApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/companies', companiesRouter);
  app.use('/api/company-members', companyMembersRouter);
  app.use('/api/jobs', jobsRouter);
  
  // Job nested routes
  app.use('/api/jobs', require('../modules/jobs/requirements/routes.js').default);
  app.use('/api/jobs', require('../modules/jobs/benefits/routes.js').default);
  app.use('/api/jobs', require('../modules/jobs/skills/routes.js').default);
  app.use('/api/applications', applicationsRouter);
  app.use('/api/saved-jobs', savedJobsRouter);
  app.use('/api/job-alerts', jobAlertsRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/uploads', uploadsRouter);
  
  // New modules
  app.use('/api/cvs', cvsRouter);
  app.use('/api/admin', adminRouter);
  
  // Additional modules
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/ai', aiRouter);
  
  // serve static uploads
  app.use('/uploads', express.static('uploads'));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

