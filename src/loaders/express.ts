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
import { profilesRouter } from '../modules/profiles/routes.js';
import { savedJobsRouter } from '../modules/saved-jobs/routes.js';
import { jobAlertsRouter } from '../modules/job-alerts/routes.js';
import { searchRouter } from '../modules/search/routes.js';
import { uploadsRouter } from '../modules/uploads/routes.js';
// New modules
import cvsRouter from '../modules/cvs/routes.js';
import companyMembersRouter from '../modules/company-members/routes.js';
import applicationManagementRouter from '../modules/application-management/routes.js';
import jobRecommendationsRouter from '../modules/job-recommendations/routes.js';
import adminRouter from '../modules/admin/routes.js';
import companyInfoRouter from '../modules/company-info/routes.js';
// Additional modules
import { notificationsRouter } from '../modules/notifications/routes.js';
import { reviewsRouter } from '../modules/reviews/routes.js';
import { aiIntegrationRouter } from '../modules/ai-integration/routes.js';

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
  app.use('/api/jobs', jobsRouter);
  app.use('/api/applications', applicationsRouter);
  app.use('/api/profile', profilesRouter);
  app.use('/api/saved-jobs', savedJobsRouter);
  app.use('/api/job-alerts', jobAlertsRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/uploads', uploadsRouter);
  
  // New modules
  app.use('/api/cvs', cvsRouter);
  app.use('/api/company-members', companyMembersRouter);
  app.use('/api/application-management', applicationManagementRouter);
  app.use('/api/job-recommendations', jobRecommendationsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/company-info', companyInfoRouter);
  
  // Additional modules
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/ai', aiIntegrationRouter);
  
  // serve static uploads
  app.use('/uploads', express.static('uploads'));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

