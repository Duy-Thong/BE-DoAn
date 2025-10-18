import { Router } from 'express';
import { AuthMiddleware } from '../../middlewares/auth.js';
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
} from './controller.js';

export const usersRouter = Router();

// All routes require authentication
usersRouter.use(AuthMiddleware.authenticate);

// Profile management - /me routes (must be before /:id routes)
usersRouter.get('/me', getMyProfile);
usersRouter.put('/me', updateMyProfile);
usersRouter.put('/me/change-password', changeMyPassword);

// CRUD routes
usersRouter.get('/', AuthMiddleware.requireAdmin, listUsers);
usersRouter.post('/', AuthMiddleware.requireAdmin, createUser);
usersRouter.get('/:id', getUser);
usersRouter.put('/:id', AuthMiddleware.requireAdmin, updateUser);
usersRouter.delete('/:id', AuthMiddleware.requireAdmin, deleteUser);

// Additional routes
usersRouter.post('/:id/lock', AuthMiddleware.requireAdmin, lockUser);
usersRouter.post('/:id/unlock', AuthMiddleware.requireAdmin, unlockUser);
usersRouter.post('/:id/verify-email', AuthMiddleware.requireAdmin, verifyEmail);
