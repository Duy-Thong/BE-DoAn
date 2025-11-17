import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.js';
import { listJobs, createJob, getJob, updateJob, deleteJob, repostJob, getCompanyJobs } from './controller.js';
import { prisma } from '../../loaders/prisma.js';

export const jobsRouter = Router();

// Public routes
jobsRouter.get('/', listJobs);
jobsRouter.get('/:id', getJob);
jobsRouter.post('/:id/view', async (req, res) => {
  try {
    // Simple view tracking by incrementing application count
    await prisma.job.update({
      where: { id: req.params.id! },
      data: {
        applicationCount: {
          increment: 1
        }
      }
    });
    res.status(201).json({ 
      success: true,
      message: 'View recorded' 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to record view'
    });
  }
});

// Protected routes
jobsRouter.use(authMiddleware);

// Job management for recruiters
jobsRouter.post('/', createJob);
jobsRouter.put('/:id', updateJob);
jobsRouter.delete('/:id', deleteJob);

// Job nested submodules routes (phải đặt trước các routes khác để tránh conflict)
import requirementsRoutes from './requirements/routes.js';
import benefitsRoutes from './benefits/routes.js';
import skillsRoutes from './skills/routes.js';
import viewsRoutes from './views/routes.js';

jobsRouter.use('/:jobId/requirements', requirementsRoutes);
jobsRouter.use('/:jobId/benefits', benefitsRoutes);
jobsRouter.use('/:jobId/skills', skillsRoutes);
jobsRouter.use('/:jobId/views', viewsRoutes);

// Company job management
jobsRouter.get('/company/:companyId', getCompanyJobs);
jobsRouter.post('/company/:companyId/repost', repostJob);

// Job applications (for recruiters) - đặt sau nested routes
jobsRouter.get('/:id/applications', async (req, res) => {
  try {
    const apps = await prisma.application.findMany({ 
      where: { jobId: req.params.id! }, 
      include: { 
        cv: {
          select: {
            id: true,
            title: true,
            fullName: true,
            userId: true,
          }
        }
      }
    });
    res.json({ 
      success: true,
      data: apps 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
});

