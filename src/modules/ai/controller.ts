import { Request, Response } from 'express';
import { AIService } from './service.js';
import { GenerateEmbeddingDto, JobRecommendationDto } from './dto.js';
import { prisma } from '../../loaders/prisma.js';

const aiService = new AIService();

export class AIController {
  // Generate embedding for text
  async generateEmbedding(req: Request, res: Response) {
    try {
      const data = GenerateEmbeddingDto.parse(req.body);
      const result = await aiService.generateEmbedding(data);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo embedding'
      });
    }
  }

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

      const result = await aiService.generateCVEmbedding(cvId, userId);

      res.json({
        success: true,
        data: result,
        message: 'Tạo embedding CV thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo embedding CV'
      });
    }
  }

  // Generate Job embedding
  async generateJobEmbedding(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const result = await aiService.generateJobEmbedding(jobId);

      res.json({
        success: true,
        data: result,
        message: 'Tạo embedding Job thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo embedding Job'
      });
    }
  }

  // Get job recommendations
  async getJobRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const data = JobRecommendationDto.parse(req.body);
      
      // Verify CV belongs to user
      const cv = await prisma.cV.findFirst({
        where: {
          id: data.cvId,
          userId
        }
      });

      if (!cv) {
        return res.status(404).json({
          success: false,
          error: 'CV không tìm thấy hoặc không có quyền truy cập'
        });
      }

      const recommendations = await aiService.getJobRecommendations(data);

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy gợi ý công việc'
      });
    }
  }
}
