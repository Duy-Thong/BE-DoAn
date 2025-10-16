import { Router } from 'express';
import { AIController } from './controller.js';
import { requireAuth } from '../../middlewares/auth.js';

const router = Router();
const aiController = new AIController();

// Tất cả routes đều cần authentication
router.use(requireAuth);

// Main AI routes
router.post('/embeddings/generate', aiController.generateEmbedding.bind(aiController));
router.post('/recommendations/jobs', aiController.getJobRecommendations.bind(aiController));

// Embedding submodule routes
router.use('/embeddings', require('./embedding/routes.js').default);

// Recommendations submodule routes
router.use('/recommendations', require('./recommendations/routes.js').default);

export default router;
