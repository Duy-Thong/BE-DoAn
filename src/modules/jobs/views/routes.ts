import { Router } from 'express';
import { JobViewController } from './controller.js';
import { authMiddleware } from '../../../middlewares/auth.js';

const router = Router({ mergeParams: true });
const controller = new JobViewController();

router.use(authMiddleware);

router.post('/', controller.create.bind(controller));
router.get('/', controller.list.bind(controller));
router.get('/stats', controller.getStats.bind(controller));
router.get('/popular', controller.getPopularJobs.bind(controller));
router.get('/user', controller.getUserViews.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.delete('/:id', controller.remove.bind(controller));

export default router;
