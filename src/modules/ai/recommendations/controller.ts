import { Request, Response } from 'express';
import { RecommendationService } from './service.js';

const recommendationService = new RecommendationService();

export class RecommendationController {
  // Get job recommendations for a user based on their CV
  async getJobRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const recommendations = await recommendationService.getJobRecommendations(userId, cvId, limit);

      res.json({
        success: true,
        data: recommendations,
        message: `Tìm thấy ${recommendations.length} công việc phù hợp`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy gợi ý công việc'
      });
    }
  }

  // Get AI-powered job recommendations
  async getAIJobRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const recommendations = await recommendationService.getAIJobRecommendations(userId, cvId, limit);

      res.json({
        success: true,
        data: recommendations,
        message: `Tìm thấy ${recommendations.length} công việc phù hợp (AI)`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy gợi ý công việc từ AI'
      });
    }
  }

  // Get similar CVs for a job (for recruiters)
  async getSimilarCVs(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const similarCVs = await recommendationService.getSimilarCVs(jobId, userId, limit);

      res.json({
        success: true,
        data: similarCVs,
        message: `Tìm thấy ${similarCVs.length} CV phù hợp`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy CV phù hợp'
      });
    }
  }

  // Get trending jobs
  async getTrendingJobs(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const trendingJobs = await recommendationService.getTrendingJobs(limit);

      res.json({
        success: true,
        data: trendingJobs,
        message: `Tìm thấy ${trendingJobs.length} công việc trending`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy công việc trending'
      });
    }
  }

  // Get personalized job recommendations
  async getPersonalizedRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const recommendations = await recommendationService.getPersonalizedRecommendations(userId, limit);

      res.json({
        success: true,
        data: recommendations,
        message: `Tìm thấy ${recommendations.length} công việc cá nhân hóa`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy gợi ý cá nhân hóa'
      });
    }
  }
}
