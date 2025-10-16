import { Router } from 'express';
import { CVController } from './controller.js';
import { requireAuth } from '../../middlewares/auth.js';

const router = Router();
const cvController = new CVController();

// Tất cả routes đều cần authentication
router.use(requireAuth);

// CV management routes
router.post('/', cvController.createCV.bind(cvController));
router.get('/', cvController.getUserCVs.bind(cvController));
router.get('/main', cvController.getMainCV.bind(cvController));
router.get('/:cvId', cvController.getCVById.bind(cvController));
router.put('/:cvId', cvController.updateCV.bind(cvController));
router.delete('/:cvId', cvController.deleteCV.bind(cvController));
router.post('/set-main', cvController.setMainCV.bind(cvController));

// CV nested submodules routes
router.use('/:cvId/work-experience', require('./work-experience/routes.js').default);
router.use('/:cvId/education', require('./education/routes.js').default);
router.use('/:cvId/languages', require('./languages/routes.js').default);
router.use('/:cvId/skills', require('./skills/routes.js').default);

export default router;
