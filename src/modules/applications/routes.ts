import { Router } from 'express';
import { AuthMiddleware } from '../../middlewares/auth.js';
import {
  listApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  updateApplicationStatus,
  getUserApplications,
  getJobApplications
} from './controller.js';

export const applicationsRouter = Router();

/**
 * Public routes
 */
// None - all application routes require authentication

/**
 * Authenticated routes
 */
// Get my applications (Candidate)
applicationsRouter.get('/mine', AuthMiddleware.authenticate, getUserApplications);

// Get all applications (Admin only - should add admin middleware)
applicationsRouter.get('/', AuthMiddleware.authenticate, listApplications);

// Get application by ID
applicationsRouter.get('/:id', AuthMiddleware.authenticate, getApplication);

// Create new application (Candidate)
applicationsRouter.post('/', AuthMiddleware.authenticate, createApplication);

// Update application (Candidate - only own applications with status PENDING)
applicationsRouter.put('/:id', AuthMiddleware.authenticate, updateApplication);

// Delete application (Candidate - only own applications with status PENDING)
applicationsRouter.delete('/:id', AuthMiddleware.authenticate, deleteApplication);

// Update application status (Recruiter/Company)
applicationsRouter.patch('/:id/status', AuthMiddleware.authenticate, updateApplicationStatus);

// Get applications for a specific job (Recruiter/Company)
applicationsRouter.get('/job/:jobId', AuthMiddleware.authenticate, getJobApplications);
