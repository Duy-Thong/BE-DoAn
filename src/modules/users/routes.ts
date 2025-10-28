import { Router } from 'express';
import { AuthMiddleware } from '../../middlewares/auth.js';
import { uploadAvatar, handleUploadError } from '../../middlewares/avatarUpload.js';
import { USER_ROLES } from '../../utils/constants.js';
import {
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  lockUser,
  unlockUser,
  verifyEmail,
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  uploadMyAvatar,
  deleteMyAvatar,
} from './controller.js';

export const usersRouter = Router();

// ========================================
// MIDDLEWARE
// ========================================
// All routes require authentication
usersRouter.use(AuthMiddleware.authenticate);

// ========================================
// PROFILE MANAGEMENT ROUTES (/me)
// ========================================
// These routes must be defined before /:id routes to avoid conflicts
usersRouter.get('/me', getMyProfile);
usersRouter.put('/me', updateMyProfile);
usersRouter.put('/me/change-password', changeMyPassword);
usersRouter.post('/me/avatar', uploadAvatar, handleUploadError, uploadMyAvatar);
usersRouter.delete('/me/avatar', deleteMyAvatar);

// ========================================
// ADMIN-ONLY ROUTES
// ========================================
// CRUD operations - Admin only
usersRouter.post('/', AuthMiddleware.requireRole(USER_ROLES.ADMIN), createUser);
usersRouter.put('/:id', AuthMiddleware.requireRole(USER_ROLES.ADMIN), updateUser);
usersRouter.delete('/:id', AuthMiddleware.requireRole(USER_ROLES.ADMIN), deleteUser);

// User management - Admin only
usersRouter.post('/:id/lock', AuthMiddleware.requireRole(USER_ROLES.ADMIN), lockUser);
usersRouter.post('/:id/unlock', AuthMiddleware.requireRole(USER_ROLES.ADMIN), unlockUser);
usersRouter.post('/:id/verify-email', AuthMiddleware.requireRole(USER_ROLES.ADMIN), verifyEmail);

// ========================================
// PUBLIC ROUTES (for authenticated users)
// ========================================
// List users - All authenticated users can search
usersRouter.get('/', listUsers);
// Get specific user - All authenticated users can view
usersRouter.get('/:id', getUser);
