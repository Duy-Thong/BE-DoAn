import { Router } from 'express';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import { listUsers, createUser, getUser, updateUser, deleteUser } from './controller.js';

export const usersRouter = Router();

// Tất cả routes đều cần authentication
usersRouter.use(requireAuth);

// User management routes
usersRouter.get('/', requireRoles('ADMIN'), listUsers);
usersRouter.post('/', requireRoles('ADMIN'), createUser);
usersRouter.get('/:id', getUser);
usersRouter.put('/:id', requireRoles('ADMIN'), updateUser);
usersRouter.delete('/:id', requireRoles('ADMIN'), deleteUser);

