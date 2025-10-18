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
import embeddingRoutes from './embedding/routes.js';
import recommendationsRoutes from './recommendations/routes.js';

router.use('/embeddings', embeddingRoutes);

// Recommendations submodule routes
router.use('/recommendations', recommendationsRoutes);

export default router;
