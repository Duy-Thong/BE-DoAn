import { Router } from 'express';
import { prisma } from '../../loaders/prisma.js';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import { listUsers, createUser, getUser, updateUser, deleteUser } from './controller.js';

// Moved DTOs and validation to dto.ts and controller.ts

export const usersRouter = Router();

usersRouter.get('/', requireAuth, requireRoles('ADMIN'), listUsers);

usersRouter.post('/', requireAuth, requireRoles('ADMIN'), createUser);

usersRouter.get('/:id', requireAuth, getUser);

usersRouter.put('/:id', requireAuth, requireRoles('ADMIN'), updateUser);

usersRouter.delete('/:id', requireAuth, requireRoles('ADMIN'), deleteUser);

