import { Router } from 'express';
import { LanguageController } from './controller.js';
import { AuthMiddleware } from '../../../middlewares/auth.js';

const router = Router({ mergeParams: true });
const controller = new LanguageController();

router.use(AuthMiddleware.authenticate);

router.post('/', controller.create.bind(controller));
router.get('/', controller.list.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.remove.bind(controller));

export default router;
