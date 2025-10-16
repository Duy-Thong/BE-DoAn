import { Request, Response } from 'express';
import { WorkExperienceService } from './service.js';
import { createWorkExperienceDto, updateWorkExperienceDto } from './dto.js';

const workExperienceService = new WorkExperienceService();

export class WorkExperienceController {
  // Tạo kinh nghiệm làm việc mới
  async createWorkExperience(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const data = createWorkExperienceDto.parse(req.body);
      const workExperience = await workExperienceService.createWorkExperience(cvId, userId, data);

      res.status(201).json({
        success: true,
        data: workExperience,
        message: 'Tạo kinh nghiệm làm việc thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo kinh nghiệm làm việc'
      });
    }
  }

  // Lấy danh sách kinh nghiệm làm việc
  async getWorkExperiences(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const workExperiences = await workExperienceService.getWorkExperiences(cvId, userId);

      res.json({
        success: true,
        data: workExperiences
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách kinh nghiệm làm việc'
      });
    }
  }

  // Lấy kinh nghiệm làm việc theo ID
  async getWorkExperienceById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId, workExperienceId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const workExperience = await workExperienceService.getWorkExperienceById(workExperienceId, cvId, userId);

      if (!workExperience) {
        return res.status(404).json({
          success: false,
          error: 'Kinh nghiệm làm việc không tìm thấy'
        });
      }

      res.json({
        success: true,
        data: workExperience
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy kinh nghiệm làm việc'
      });
    }
  }

  // Cập nhật kinh nghiệm làm việc
  async updateWorkExperience(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId, workExperienceId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const data = updateWorkExperienceDto.parse(req.body);
      const workExperience = await workExperienceService.updateWorkExperience(workExperienceId, cvId, userId, data);

      res.json({
        success: true,
        data: workExperience,
        message: 'Cập nhật kinh nghiệm làm việc thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật kinh nghiệm làm việc'
      });
    }
  }

  // Xóa kinh nghiệm làm việc
  async deleteWorkExperience(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId, workExperienceId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      await workExperienceService.deleteWorkExperience(workExperienceId, cvId, userId);

      res.json({
        success: true,
        message: 'Xóa kinh nghiệm làm việc thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa kinh nghiệm làm việc'
      });
    }
  }
}
