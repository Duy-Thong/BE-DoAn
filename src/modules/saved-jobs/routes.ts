import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { prisma } from '../../loaders/prisma.js';

export const savedJobsRouter = Router();

savedJobsRouter.get('/', requireAuth, async (req, res) => {
  const items = await prisma.savedJob.findMany({ where: { userId: req.user!.id }, include: { job: true } });
  res.json({ data: items });
});

savedJobsRouter.post('/:jobId', requireAuth, async (req, res) => {
  const item = await prisma.savedJob.upsert({
    where: { userId_jobId: { userId: req.user!.id, jobId: req.params.jobId! } },
    update: {},
    create: { userId: req.user!.id, jobId: req.params.jobId! },
  });
  res.status(201).json({ data: item });
});

savedJobsRouter.delete('/:jobId', requireAuth, async (req, res) => {
  await prisma.savedJob.delete({ where: { userId_jobId: { userId: req.user!.id, jobId: req.params.jobId! } } });
  res.status(204).end();
});

