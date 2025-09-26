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

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

