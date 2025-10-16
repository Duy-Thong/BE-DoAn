import { Request, Response } from 'express';
import { AchievementService } from './service.js';
import { createAchievementDto, updateAchievementDto } from './dto.js';

const service = new AchievementService();

export class AchievementController {
  async create(req: Request, res: Response) {
    try {
      const { cvId } = req.params;
      const data = createAchievementDto.parse(req.body);
      const achievement = await service.createAchievement(cvId, data);
      res.status(201).json({ 
        success: true,
        data: achievement,
        message: 'Tạo thành tích thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo thành tích'
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { cvId } = req.params;
      const achievements = await service.getAchievements(cvId);
      res.json({ 
        success: true,
        data: achievements 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách thành tích'
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      const achievement = await service.getAchievementById(cvId, id);
      if (!achievement) {
        return res.status(404).json({ 
          success: false,
          error: 'Thành tích không tìm thấy' 
        });
      }
      res.json({ 
        success: true,
        data: achievement 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy thông tin thành tích'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      const data = updateAchievementDto.parse(req.body);
      const achievement = await service.updateAchievement(cvId, id, data);
      res.json({ 
        success: true,
        data: achievement,
        message: 'Cập nhật thành tích thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật thành tích'
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      await service.deleteAchievement(cvId, id);
      res.json({
        success: true,
        message: 'Xóa thành tích thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa thành tích'
      });
    }
  }
}
