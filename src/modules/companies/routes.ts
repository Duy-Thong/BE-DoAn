import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.js';
import { listCompanies, createCompany, getCompany, updateCompany, deleteCompany, getUserCompanies } from './controller.js';

export const companiesRouter = Router();

// Public routes
companiesRouter.get('/', listCompanies);
companiesRouter.get('/:id', getCompany);

// Protected routes
companiesRouter.use(authMiddleware);

// Company management
companiesRouter.post('/', createCompany);
companiesRouter.put('/:id', updateCompany);
companiesRouter.delete('/:id', deleteCompany);
companiesRouter.get('/user/my-companies', getUserCompanies);

// Company nested submodules routes
import socialMediaRoutes from './social-media/routes.js';
companiesRouter.use('/:companyId/social-media', socialMediaRoutes);

