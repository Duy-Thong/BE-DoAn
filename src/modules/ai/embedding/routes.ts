import { Router } from 'express';
import { EmbeddingController } from './controller.js';
import { AuthMiddleware } from '../../../middlewares/auth.js';

const router = Router();
const embeddingController = new EmbeddingController();

// Tất cả routes đều cần authentication
router.use(AuthMiddleware.authenticate);

// CV Embedding routes
router.post('/cv/:cvId', embeddingController.generateCVEmbedding.bind(embeddingController));
router.post('/cv/batch', embeddingController.batchGenerateCVEmbeddings.bind(embeddingController));

// Job Embedding routes
router.post('/job/:jobId', embeddingController.generateJobEmbedding.bind(embeddingController));
router.post('/job/batch', embeddingController.batchGenerateJobEmbeddings.bind(embeddingController));

export default router;
