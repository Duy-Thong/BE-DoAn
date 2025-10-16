import { Request, Response } from 'express';
import { EmbeddingService } from './service.js';

const embeddingService = new EmbeddingService();

export class EmbeddingController {
  // Generate CV embedding
  async generateCVEmbedding(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const cv = await embeddingService.generateCVEmbedding(cvId, userId);

      res.json({
        success: true,
        data: cv,
        message: 'Tạo embedding cho CV thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo embedding cho CV'
      });
    }
  }

  // Generate Job embedding
  async generateJobEmbedding(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const job = await embeddingService.generateJobEmbedding(jobId, userId);

      res.json({
        success: true,
        data: job,
        message: 'Tạo embedding cho Job thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo embedding cho Job'
      });
    }
  }

  // Batch generate CV embeddings
  async batchGenerateCVEmbeddings(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvIds } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const results = await embeddingService.batchGenerateCVEmbeddings(userId, cvIds);

      res.json({
        success: true,
        data: results,
        message: `Xử lý ${results.length} CV embeddings`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo batch CV embeddings'
      });
    }
  }

  // Batch generate Job embeddings
  async batchGenerateJobEmbeddings(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { companyId, jobIds } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'Company ID là bắt buộc'
        });
      }

      const results = await embeddingService.batchGenerateJobEmbeddings(companyId, userId, jobIds);

      res.json({
        success: true,
        data: results,
        message: `Xử lý ${results.length} Job embeddings`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo batch Job embeddings'
      });
    }
  }
}
