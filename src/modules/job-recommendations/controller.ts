import { Request, Response } from 'express';
import { JobRecommendationService } from './service.js';
import { getRecommendationsDto, updateRecommendationDto } from './dto.js';

const recommendationService = new JobRecommendationService();

export class JobRecommendationController {
  // Tạo gợi ý việc làm mới
  async generateRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters = getRecommendationsDto.parse({
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      });

      const result = await recommendationService.generateRecommendations(userId, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate recommendations'
      });
    }
  }

  // Lấy danh sách gợi ý đã lưu
  async getSavedRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters = getRecommendationsDto.parse({
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      });

      const result = await recommendationService.getSavedRecommendations(userId, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recommendations'
      });
    }
  }

  // Cập nhật điểm gợi ý
  async updateRecommendation(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = updateRecommendationDto.parse(req.body);
      const recommendation = await recommendationService.updateRecommendation(userId, data);

      res.json({
        success: true,
        data: recommendation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update recommendation'
      });
    }
  }

  // Xóa gợi ý
  async removeRecommendation(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await recommendationService.removeRecommendation(userId, jobId);

      res.json({
        success: true,
        message: 'Recommendation removed successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove recommendation'
      });
    }
  }
}
