import { Request, Response } from 'express';
import { JobViewService } from './service.js';
import { createJobViewDto, updateJobViewDto } from './dto.js';

const service = new JobViewService();

export class JobViewController {
  async create(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const data = createJobViewDto.parse({
        ...req.body,
        jobId,
        userId: req.user?.id,
      });
      const jobView = await service.createJobView(data);
      res.status(201).json({ 
        success: true,
        data: jobView,
        message: 'Tạo lượt xem thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo lượt xem'
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const jobViews = await service.getJobViews(jobId);
      res.json({ 
        success: true,
        data: jobViews 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách lượt xem'
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { jobId, id } = req.params;
      const jobView = await service.getJobViewById(jobId, id);
      if (!jobView) {
        return res.status(404).json({ 
          success: false,
          error: 'Lượt xem không tìm thấy' 
        });
      }
      res.json({ 
        success: true,
        data: jobView 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy thông tin lượt xem'
      });
    }
  }

  async getUserViews(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const jobViews = await service.getUserJobViews(userId);
      res.json({ 
        success: true,
        data: jobViews 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách lượt xem của người dùng'
      });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const stats = await service.getJobViewStats(jobId);
      res.json({ 
        success: true,
        data: stats 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy thống kê lượt xem'
      });
    }
  }

  async getPopularJobs(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const popularJobs = await service.getPopularJobs(limit);
      res.json({ 
        success: true,
        data: popularJobs 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách công việc phổ biến'
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { jobId, id } = req.params;
      await service.deleteJobView(jobId, id);
      res.json({
        success: true,
        message: 'Xóa lượt xem thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa lượt xem'
      });
    }
  }
}
