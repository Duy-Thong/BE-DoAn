import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import { getProfile, upsertProfile } from './controller.js';

export const profilesRouter = Router();

profilesRouter.get('/me', requireAuth, getProfile);
profilesRouter.put('/me', requireAuth, upsertProfile);

