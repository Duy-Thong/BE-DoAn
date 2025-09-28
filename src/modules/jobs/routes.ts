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
    await prisma.jobView.create({ data: { jobId: req.params.id! } });
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

// Company job management
jobsRouter.get('/company/:companyId', getCompanyJobs);
jobsRouter.post('/company/:companyId/repost', repostJob);

// Job applications (for recruiters)
jobsRouter.get('/:id/applications', async (req, res) => {
  try {
    const apps = await prisma.application.findMany({ 
      where: { jobId: req.params.id! }, 
      include: { 
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profile: true
          }
        },
        cv: {
          select: {
            id: true,
            title: true,
            fileName: true
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

