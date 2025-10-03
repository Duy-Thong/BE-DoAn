import { Router } from 'express';
import { JobRecommendationController } from './controller.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = Router();
const recommendationController = new JobRecommendationController();

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// Job recommendation routes
router.get('/generate', recommendationController.generateRecommendations.bind(recommendationController));
router.get('/saved', recommendationController.getSavedRecommendations.bind(recommendationController));
router.get('/ai/:userId', recommendationController.getAIRecommendations.bind(recommendationController));
router.put('/update', recommendationController.updateRecommendation.bind(recommendationController));
router.delete('/:jobId', recommendationController.removeRecommendation.bind(recommendationController));

export default router;
