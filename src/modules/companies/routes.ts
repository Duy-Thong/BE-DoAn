import { Router } from 'express';
import { AuthMiddleware } from '../../middlewares/auth.js';
import { uploadAvatar, handleUploadError } from '../../middlewares/avatarUpload.js';
import { CompaniesController } from './controller.js';
import socialMediaRoutes from './social-media/routes.js';

export const companiesRouter = Router();
const controller = new CompaniesController();

// Public routes - Anyone can view
companiesRouter.get('/', controller.list.bind(controller));
companiesRouter.get('/:id', controller.getById.bind(controller));
companiesRouter.get('/:id/jobs', controller.getJobs.bind(controller));

// Protected routes - Require authentication
companiesRouter.use(AuthMiddleware.authenticate);

// CRUD routes
companiesRouter.post('/', AuthMiddleware.requireRecruiterOrAdmin, controller.create.bind(controller));
companiesRouter.put('/:id', AuthMiddleware.requireRecruiterOrAdmin, controller.update.bind(controller));
companiesRouter.delete('/:id', AuthMiddleware.requireAdmin, controller.remove.bind(controller));

// Admin routes - Company status management
companiesRouter.post('/:id/verify', AuthMiddleware.requireAdmin, controller.verify.bind(controller));
companiesRouter.post('/:id/unverify', AuthMiddleware.requireAdmin, controller.unverify.bind(controller));
companiesRouter.post('/:id/activate', AuthMiddleware.requireAdmin, controller.activate.bind(controller));
companiesRouter.post('/:id/deactivate', AuthMiddleware.requireAdmin, controller.deactivate.bind(controller));

// Member management
companiesRouter.get('/:id/users', controller.getUsers.bind(controller));
companiesRouter.post('/:id/users', AuthMiddleware.requireRecruiterOrAdmin, controller.assignUser.bind(controller));
companiesRouter.put('/:id/users/:userId/role', AuthMiddleware.requireRecruiterOrAdmin, controller.updateUserRole.bind(controller));
companiesRouter.delete('/:id/users/:userId', AuthMiddleware.requireRecruiterOrAdmin, controller.removeUser.bind(controller));

// Company logo/avatar management
companiesRouter.post('/:id/logo', AuthMiddleware.requireRecruiterOrAdmin, uploadAvatar, handleUploadError, controller.uploadLogo.bind(controller));
companiesRouter.delete('/:id/logo', AuthMiddleware.requireRecruiterOrAdmin, controller.deleteLogo.bind(controller));

// Company banner management
companiesRouter.post('/:id/banner', AuthMiddleware.requireRecruiterOrAdmin, uploadAvatar, handleUploadError, controller.uploadBanner.bind(controller));
companiesRouter.delete('/:id/banner', AuthMiddleware.requireRecruiterOrAdmin, controller.deleteBanner.bind(controller));

// Social Media nested routes
companiesRouter.use('/:companyId/social-media', socialMediaRoutes);

