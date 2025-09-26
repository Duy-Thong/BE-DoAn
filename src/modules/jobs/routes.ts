import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import { listJobs, createJob, getJob, updateJob, deleteJob } from './controller.js';
import { prisma } from '../../loaders/prisma.js';

export const jobsRouter = Router();

jobsRouter.get('/', listJobs);
jobsRouter.get('/:id', getJob);
jobsRouter.post('/:id/view', async (req, res) => {
  await prisma.jobView.create({ data: { jobId: req.params.id! } });
  res.status(201).json({ ok: true });
});
jobsRouter.get('/:id/applications', requireAuth, requireRoles('ADMIN', 'RECRUITER'), async (req, res) => {
  const apps = await prisma.application.findMany({ where: { jobId: req.params.id! }, include: { user: true } });
  res.json({ data: apps });
});

jobsRouter.post('/', requireAuth, requireRoles('ADMIN', 'RECRUITER'), createJob);

jobsRouter.put('/:id', requireAuth, requireRoles('ADMIN', 'RECRUITER'), updateJob);

jobsRouter.delete('/:id', requireAuth, requireRoles('ADMIN', 'RECRUITER'), deleteJob);

