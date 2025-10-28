import { Router } from 'express';
import { AuthMiddleware } from '../../middlewares/auth.js';
import { uploadAvatar, handleUploadError } from '../../middlewares/avatarUpload.js';
import { CompaniesController } from './controller.js';
import socialMediaRoutes from './social-media/routes.js';

/**
 * Companies Routes
 * Handles company endpoints
 * Uses CompaniesController for request handling
 */
export const companiesRouter = Router();
const controller = new CompaniesController();

// ========================================
// PUBLIC ROUTES (anyone can view)
// ========================================
companiesRouter.get('/', controller.list.bind(controller));
companiesRouter.get('/:id', controller.getById.bind(controller));
companiesRouter.get('/:id/jobs', controller.getJobs.bind(controller));

// ========================================
// PROTECTED ROUTES (authentication required)
// ========================================
companiesRouter.use(AuthMiddleware.authenticate);

// ========================================
// CRUD ROUTES
// ========================================
companiesRouter.post('/', AuthMiddleware.requireRecruiterOrAdmin, controller.create.bind(controller));
companiesRouter.put('/:id', AuthMiddleware.requireRecruiterOrAdmin, controller.update.bind(controller));
companiesRouter.delete('/:id', AuthMiddleware.requireAdmin, controller.remove.bind(controller));

// ========================================
// ADMIN ROUTES (company status management)
// ========================================
companiesRouter.post('/:id/verify', AuthMiddleware.requireAdmin, controller.verify.bind(controller));
companiesRouter.post('/:id/unverify', AuthMiddleware.requireAdmin, controller.unverify.bind(controller));
companiesRouter.post('/:id/activate', AuthMiddleware.requireAdmin, controller.activate.bind(controller));
companiesRouter.post('/:id/deactivate', AuthMiddleware.requireAdmin, controller.deactivate.bind(controller));

// ========================================
// MEMBER MANAGEMENT ROUTES
// ========================================
companiesRouter.get('/:id/users', controller.getUsers.bind(controller));
companiesRouter.post('/:id/users', AuthMiddleware.requireRecruiterOrAdmin, controller.assignUser.bind(controller));
companiesRouter.put('/:id/users/:userId/role', AuthMiddleware.requireRecruiterOrAdmin, controller.updateUserRole.bind(controller));
companiesRouter.delete('/:id/users/:userId', AuthMiddleware.requireRecruiterOrAdmin, controller.removeUser.bind(controller));

// ========================================
// COMPANY LOGO MANAGEMENT
// ========================================
companiesRouter.post('/:id/logo', AuthMiddleware.requireRecruiterOrAdmin, uploadAvatar, handleUploadError, controller.uploadLogo.bind(controller));
companiesRouter.delete('/:id/logo', AuthMiddleware.requireRecruiterOrAdmin, controller.deleteLogo.bind(controller));

// ========================================
// COMPANY BANNER MANAGEMENT
// ========================================
companiesRouter.post('/:id/banner', AuthMiddleware.requireRecruiterOrAdmin, uploadAvatar, handleUploadError, controller.uploadBanner.bind(controller));
companiesRouter.delete('/:id/banner', AuthMiddleware.requireRecruiterOrAdmin, controller.deleteBanner.bind(controller));

// ========================================
// SOCIAL MEDIA NESTED ROUTES
// ========================================
companiesRouter.use('/:companyId/social-media', socialMediaRoutes);

