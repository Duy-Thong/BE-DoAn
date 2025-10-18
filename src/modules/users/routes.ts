import { Router } from 'express';
import { AuthMiddleware } from '../../middlewares/auth.js';
import { listUsers, createUser, getUser, updateUser, deleteUser } from './controller.js';

export const usersRouter = Router();

// Tất cả routes đều cần authentication
usersRouter.use(AuthMiddleware.authenticate);

// User management routes
usersRouter.get('/', AuthMiddleware.requireAdmin, listUsers);
usersRouter.post('/', AuthMiddleware.requireAdmin, createUser);
usersRouter.get('/:id', getUser);
usersRouter.put('/:id', AuthMiddleware.requireAdmin, updateUser);
usersRouter.delete('/:id', AuthMiddleware.requireAdmin, deleteUser);

