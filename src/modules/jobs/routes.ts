import { Router } from 'express';
import { prisma } from '../../loaders/prisma.js';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import { listJobs, createJob, getJob, updateJob, deleteJob } from './controller.js';

export const jobsRouter = Router();

jobsRouter.get('/', listJobs);
jobsRouter.get('/:id', getJob);

jobsRouter.post('/', requireAuth, requireRoles('ADMIN', 'RECRUITER'), createJob);

jobsRouter.put('/:id', requireAuth, requireRoles('ADMIN', 'RECRUITER'), updateJob);

jobsRouter.delete('/:id', requireAuth, requireRoles('ADMIN', 'RECRUITER'), deleteJob);

