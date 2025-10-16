import { Request, Response } from 'express';
import { ActivityService } from './service.js';
import { createActivityDto, updateActivityDto } from './dto.js';

const service = new ActivityService();

export class ActivityController {
  async create(req: Request, res: Response) {
    try {
      const { cvId } = req.params;
      const data = createActivityDto.parse(req.body);
      const activity = await service.createActivity(cvId, data);
      res.status(201).json({ 
        success: true,
        data: activity,
        message: 'Tạo hoạt động thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo hoạt động'
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { cvId } = req.params;
      const activities = await service.getActivities(cvId);
      res.json({ 
        success: true,
        data: activities 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách hoạt động'
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      const activity = await service.getActivityById(cvId, id);
      if (!activity) {
        return res.status(404).json({ 
          success: false,
          error: 'Hoạt động không tìm thấy' 
        });
      }
      res.json({ 
        success: true,
        data: activity 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy thông tin hoạt động'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      const data = updateActivityDto.parse(req.body);
      const activity = await service.updateActivity(cvId, id, data);
      res.json({ 
        success: true,
        data: activity,
        message: 'Cập nhật hoạt động thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật hoạt động'
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      await service.deleteActivity(cvId, id);
      res.json({
        success: true,
        message: 'Xóa hoạt động thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa hoạt động'
      });
    }
  }
}
