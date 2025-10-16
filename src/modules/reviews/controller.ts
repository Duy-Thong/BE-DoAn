import { Request, Response } from 'express';
import { ReviewService } from './service.js';
import { createReviewDto, updateReviewDto } from './dto.js';

const service = new ReviewService();

export class ReviewController {
  async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const data = createReviewDto.parse(req.body);
      const review = await service.createReview(userId, data);
      res.status(201).json({ 
        success: true,
        data: review,
        message: 'Tạo đánh giá thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo đánh giá'
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        rating: req.query.rating ? parseInt(req.query.rating as string) : undefined,
      };

      const result = await service.getReviews(companyId, options);
      res.json({ 
        success: true,
        data: result.reviews,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách đánh giá'
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const review = await service.getReviewById(id);
      if (!review) {
        return res.status(404).json({ 
          success: false,
          error: 'Đánh giá không tìm thấy' 
        });
      }
      res.json({ 
        success: true,
        data: review 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy thông tin đánh giá'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const { id } = req.params;
      const data = updateReviewDto.parse(req.body);
      const review = await service.updateReview(userId, id, data);
      res.json({ 
        success: true,
        data: review,
        message: 'Cập nhật đánh giá thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật đánh giá'
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const { id } = req.params;
      await service.deleteReview(userId, id);
      res.json({
        success: true,
        message: 'Xóa đánh giá thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa đánh giá'
      });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const stats = await service.getCompanyReviewStats(companyId);
      res.json({ 
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy thống kê đánh giá'
      });
    }
  }

  async getUserReviews(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const reviews = await service.getUserReviews(userId);
      res.json({ 
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy đánh giá của người dùng'
      });
    }
  }

  async getRecentReviews(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const reviews = await service.getRecentReviews(limit);
      res.json({ 
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy đánh giá gần đây'
      });
    }
  }
}
