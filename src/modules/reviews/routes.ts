import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.js';
import { ReviewController } from './controller.js';

export const reviewsRouter = Router();
const controller = new ReviewController();

// Public routes
reviewsRouter.get('/company/:companyId', controller.list.bind(controller));
reviewsRouter.get('/company/:companyId/stats', controller.getStats.bind(controller));
reviewsRouter.get('/recent', controller.getRecentReviews.bind(controller));
reviewsRouter.get('/:id', controller.getById.bind(controller));

// Protected routes
reviewsRouter.use(authMiddleware);

reviewsRouter.post('/', controller.create.bind(controller));
reviewsRouter.get('/user/my-reviews', controller.getUserReviews.bind(controller));
reviewsRouter.put('/:id', controller.update.bind(controller));
reviewsRouter.delete('/:id', controller.remove.bind(controller));