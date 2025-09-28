import { Router } from 'express';
import { CVController } from './controller.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = Router();
const cvController = new CVController();

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// CV management routes
router.post('/', cvController.createCV.bind(cvController));
router.get('/', cvController.getUserCVs.bind(cvController));
router.get('/main', cvController.getMainCV.bind(cvController));
router.get('/:cvId', cvController.getCVById.bind(cvController));
router.put('/:cvId', cvController.updateCV.bind(cvController));
router.delete('/:cvId', cvController.deleteCV.bind(cvController));
router.post('/set-main', cvController.setMainCV.bind(cvController));
router.get('/:cvId/download', cvController.downloadCV.bind(cvController));

export default router;
