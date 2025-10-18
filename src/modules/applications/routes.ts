import { Router } from 'express';
import { prisma } from '../../loaders/prisma.js';
import { AuthMiddleware } from '../../middlewares/auth.js';
import { listApplications, createApplication, updateApplicationStatus } from './controller.js';

export const applicationsRouter = Router();

applicationsRouter.get('/', listApplications);
applicationsRouter.post('/', AuthMiddleware.authenticate, createApplication);
applicationsRouter.get('/mine', AuthMiddleware.authenticate, async (req, res) => {
  const apps = await prisma.application.findMany({ where: { userId: req.user!.id } });
  res.json({ data: apps });
});
applicationsRouter.put('/:id/status', AuthMiddleware.authenticate, updateApplicationStatus);

