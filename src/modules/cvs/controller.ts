import { Request, Response } from 'express';
import { CVService } from './service.js';
import { createCVDto, updateCVDto, setMainCVDto } from './dto.js';

const cvService = new CVService();

export class CVController {
  // Tạo CV mới
  async createCV(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = createCVDto.parse(req.body);
      const cv = await cvService.createCV(userId, data);

      res.status(201).json({
        success: true,
        data: cv
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create CV'
      });
    }
  }

  // Lấy danh sách CV của user
  async getUserCVs(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const cvs = await cvService.getUserCVs(userId);

      res.json({
        success: true,
        data: cvs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch CVs'
      });
    }
  }

  // Lấy CV theo ID
  async getCVById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const cv = await cvService.getCVById(cvId, userId);
      if (!cv) {
        return res.status(404).json({
          success: false,
          error: 'CV not found'
        });
      }

      res.json({
        success: true,
        data: cv
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch CV'
      });
    }
  }

  // Cập nhật CV
  async updateCV(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = updateCVDto.parse(req.body);
      const cv = await cvService.updateCV(cvId, userId, data);

      res.json({
        success: true,
        data: cv
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update CV'
      });
    }
  }

  // Đặt CV làm CV chính
  async setMainCV(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = setMainCVDto.parse(req.body);
      const cv = await cvService.setMainCV(userId, data);

      res.json({
        success: true,
        data: cv
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set main CV'
      });
    }
  }

  // Xóa CV
  async deleteCV(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await cvService.deleteCV(cvId, userId);

      res.json({
        success: true,
        message: 'CV deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete CV'
      });
    }
  }

  // Lấy CV chính
  async getMainCV(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const cv = await cvService.getMainCV(userId);

      res.json({
        success: true,
        data: cv
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch main CV'
      });
    }
  }

  // Download CV
  async downloadCV(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const cvData = await cvService.downloadCV(cvId, userId);

      res.json({
        success: true,
        data: cvData
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to download CV'
      });
    }
  }
}
