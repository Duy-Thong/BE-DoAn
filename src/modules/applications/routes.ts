import { Router } from 'express';
import { prisma } from '../../loaders/prisma.js';
import { requireAuth } from '../../middlewares/auth.js';
import { listApplications, createApplication, updateApplicationStatus } from './controller.js';

export const applicationsRouter = Router();

applicationsRouter.get('/', listApplications);
applicationsRouter.post('/', requireAuth, createApplication);
applicationsRouter.get('/mine', requireAuth, async (req, res) => {
  const apps = await prisma.application.findMany({ where: { userId: req.user!.id } });
  res.json({ data: apps });
});
applicationsRouter.put('/:id/status', requireAuth, updateApplicationStatus);

