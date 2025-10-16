import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { SavedJobController } from './controller.js';

export const savedJobsRouter = Router();
const savedJobController = new SavedJobController();

// Protected routes
savedJobsRouter.use(requireAuth);

// Get user's saved jobs
savedJobsRouter.get('/', savedJobController.getSavedJobs.bind(savedJobController));

// Save a job
savedJobsRouter.post('/', savedJobController.createSavedJob.bind(savedJobController));

// Get saved job by ID
savedJobsRouter.get('/:id', savedJobController.getSavedJobById.bind(savedJobController));

// Remove a saved job
savedJobsRouter.delete('/:id', savedJobController.deleteSavedJob.bind(savedJobController));

// Remove a saved job by job ID
savedJobsRouter.delete('/job/:jobId', savedJobController.deleteSavedJobByJobId.bind(savedJobController));

// Check if job is saved
savedJobsRouter.get('/check/:jobId', savedJobController.isJobSaved.bind(savedJobController));

// Get saved job count
savedJobsRouter.get('/stats/count', savedJobController.getSavedJobCount.bind(savedJobController));

