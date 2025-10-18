import { Router } from 'express';
import { CompanySocialMediaController } from './controller.js';

const router = Router({ mergeParams: true });
const controller = new CompanySocialMediaController();

// NOTE: Auth middleware already applied in parent router (companies/routes.ts)

router.post('/', controller.create.bind(controller));
router.get('/', controller.list.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.remove.bind(controller));

export default router;
