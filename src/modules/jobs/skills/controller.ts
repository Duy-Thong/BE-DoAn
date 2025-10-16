import { Request, Response } from 'express';
import { JobSkillService } from './service.js';
import { createJobSkillDto, updateJobSkillDto } from './dto.js';

const jobSkillService = new JobSkillService();

export class JobSkillController {
  // Tạo kỹ năng công việc mới
  async createJobSkill(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const data = createJobSkillDto.parse(req.body);
      const skill = await jobSkillService.createJobSkill(jobId, userId, data);

      res.status(201).json({
        success: true,
        data: skill,
        message: 'Tạo kỹ năng công việc thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo kỹ năng công việc'
      });
    }
  }

  // Lấy danh sách kỹ năng
  async getJobSkills(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const skills = await jobSkillService.getJobSkills(jobId, userId);

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
  async getJobSkillById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId, skillId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const skill = await jobSkillService.getJobSkillById(skillId, jobId, userId);

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
  async updateJobSkill(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId, skillId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const data = updateJobSkillDto.parse(req.body);
      const skill = await jobSkillService.updateJobSkill(skillId, jobId, userId, data);

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
  async deleteJobSkill(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId, skillId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      await jobSkillService.deleteJobSkill(skillId, jobId, userId);

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
