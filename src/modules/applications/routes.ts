import { Router } from 'express';
import { prisma } from '../../loaders/prisma.js';
import { requireAuth } from '../../middlewares/auth.js';
import { listApplications, createApplication } from './controller.js';

export const applicationsRouter = Router();

applicationsRouter.get('/', listApplications);
applicationsRouter.post('/', requireAuth, createApplication);

