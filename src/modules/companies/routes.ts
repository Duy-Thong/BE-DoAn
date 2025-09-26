import { Router } from 'express';
import { prisma } from '../../loaders/prisma.js';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import { listCompanies, createCompany, getCompany, updateCompany, deleteCompany } from './controller.js';

export const companiesRouter = Router();

companiesRouter.get('/', listCompanies);
companiesRouter.get('/:id', getCompany);
companiesRouter.post('/', requireAuth, requireRoles('ADMIN', 'RECRUITER'), createCompany);
companiesRouter.put('/:id', requireAuth, requireRoles('ADMIN', 'RECRUITER'), updateCompany);
companiesRouter.delete('/:id', requireAuth, requireRoles('ADMIN'), deleteCompany);

