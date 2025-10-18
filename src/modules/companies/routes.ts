import { Router } from 'express';
import { AuthMiddleware } from '../../middlewares/auth.js';
import {
  listCompanies,
  createCompany,
  getCompany,
  updateCompany,
  deleteCompany,
  verifyCompany,
  unverifyCompany,
  activateCompany,
  deactivateCompany,
  getCompanyJobs,
  getCompanyUsers,
  assignUserToCompany,
  removeUserFromCompany,
  updateUserRole,
} from './controller.js';

export const companiesRouter = Router();

// Public routes - Anyone can view
companiesRouter.get('/', listCompanies);
companiesRouter.get('/:id', getCompany);
companiesRouter.get('/:id/jobs', getCompanyJobs);

// Protected routes - Require authentication
companiesRouter.use(AuthMiddleware.authenticate);

// CRUD routes
companiesRouter.post('/', AuthMiddleware.requireRecruiterOrAdmin, createCompany);
companiesRouter.put('/:id', AuthMiddleware.requireRecruiterOrAdmin, updateCompany);
companiesRouter.delete('/:id', AuthMiddleware.requireAdmin, deleteCompany);

// Admin routes - Company status management
companiesRouter.post('/:id/verify', AuthMiddleware.requireAdmin, verifyCompany);
companiesRouter.post('/:id/unverify', AuthMiddleware.requireAdmin, unverifyCompany);
companiesRouter.post('/:id/activate', AuthMiddleware.requireAdmin, activateCompany);
companiesRouter.post('/:id/deactivate', AuthMiddleware.requireAdmin, deactivateCompany);

// Member management
companiesRouter.get('/:id/users', getCompanyUsers);
companiesRouter.post('/:id/users', AuthMiddleware.requireRecruiterOrAdmin, assignUserToCompany);
companiesRouter.put('/:id/users/:userId/role', AuthMiddleware.requireRecruiterOrAdmin, updateUserRole);
companiesRouter.delete('/:id/users/:userId', AuthMiddleware.requireRecruiterOrAdmin, removeUserFromCompany);

