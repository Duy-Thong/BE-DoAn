import { Router } from 'express';
import { RecommendationController } from './controller.js';
import { requireAuth } from '../../../middlewares/auth.js';

const router = Router();
const recommendationController = new RecommendationController();

// Tất cả routes đều cần authentication
router.use(requireAuth);

// Job Recommendations routes
router.get('/jobs/:cvId', recommendationController.getJobRecommendations.bind(recommendationController));
router.get('/jobs/ai/:cvId', recommendationController.getAIJobRecommendations.bind(recommendationController));
router.get('/jobs/trending', recommendationController.getTrendingJobs.bind(recommendationController));
router.get('/jobs/personalized', recommendationController.getPersonalizedRecommendations.bind(recommendationController));

// CV Recommendations routes (for recruiters)
router.get('/cvs/:jobId', recommendationController.getSimilarCVs.bind(recommendationController));

export default router;
