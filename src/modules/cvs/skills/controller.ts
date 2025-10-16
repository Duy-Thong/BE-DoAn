import { Request, Response } from 'express';
import { CVSkillService } from './service.js';
import { createCVSkillDto, updateCVSkillDto } from './dto.js';

const cvSkillService = new CVSkillService();

export class CVSkillController {
  // Tạo kỹ năng mới
  async createCVSkill(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const data = createCVSkillDto.parse(req.body);
      const skill = await cvSkillService.createCVSkill(cvId, userId, data);

      res.status(201).json({
        success: true,
        data: skill,
        message: 'Tạo kỹ năng thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo kỹ năng'
      });
    }
  }

  // Lấy danh sách kỹ năng
  async getCVSkills(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const skills = await cvSkillService.getCVSkills(cvId, userId);

      res.json({
        success: true,
        data: skills
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách kỹ năng'
      });
    }
  }

  // Lấy kỹ năng theo ID
  async getCVSkillById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId, skillId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const skill = await cvSkillService.getCVSkillById(skillId, cvId, userId);

      if (!skill) {
        return res.status(404).json({
          success: false,
          error: 'Kỹ năng không tìm thấy'
        });
      }

      res.json({
        success: true,
        data: skill
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy kỹ năng'
      });
    }
  }

  // Cập nhật kỹ năng
  async updateCVSkill(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId, skillId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const data = updateCVSkillDto.parse(req.body);
      const skill = await cvSkillService.updateCVSkill(skillId, cvId, userId, data);

      res.json({
        success: true,
        data: skill,
        message: 'Cập nhật kỹ năng thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật kỹ năng'
      });
    }
  }

  // Xóa kỹ năng
  async deleteCVSkill(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId, skillId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      await cvSkillService.deleteCVSkill(skillId, cvId, userId);

      res.json({
        success: true,
        message: 'Xóa kỹ năng thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa kỹ năng'
      });
    }
  }
}
