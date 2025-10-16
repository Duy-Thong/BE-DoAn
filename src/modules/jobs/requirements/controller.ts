import { Request, Response } from 'express';
import { JobRequirementService } from './service.js';
import { createJobRequirementDto, updateJobRequirementDto } from './dto.js';

const jobRequirementService = new JobRequirementService();

export class JobRequirementController {
  // Tạo yêu cầu công việc mới
  async createJobRequirement(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const data = createJobRequirementDto.parse(req.body);
      const requirement = await jobRequirementService.createJobRequirement(jobId, userId, data);

      res.status(201).json({
        success: true,
        data: requirement,
        message: 'Tạo yêu cầu công việc thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo yêu cầu công việc'
      });
    }
  }

  // Lấy danh sách yêu cầu
  async getJobRequirements(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const requirements = await jobRequirementService.getJobRequirements(jobId, userId);

      res.json({
        success: true,
        data: requirements
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách yêu cầu'
      });
    }
  }

  // Lấy yêu cầu theo ID
  async getJobRequirementById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId, requirementId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const requirement = await jobRequirementService.getJobRequirementById(requirementId, jobId, userId);

      if (!requirement) {
        return res.status(404).json({
          success: false,
          error: 'Yêu cầu không tìm thấy'
        });
      }

      res.json({
        success: true,
        data: requirement
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy yêu cầu'
      });
    }
  }

  // Cập nhật yêu cầu
  async updateJobRequirement(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId, requirementId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const data = updateJobRequirementDto.parse(req.body);
      const requirement = await jobRequirementService.updateJobRequirement(requirementId, jobId, userId, data);

      res.json({
        success: true,
        data: requirement,
        message: 'Cập nhật yêu cầu thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật yêu cầu'
      });
    }
  }

  // Xóa yêu cầu
  async deleteJobRequirement(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId, requirementId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      await jobRequirementService.deleteJobRequirement(requirementId, jobId, userId);

      res.json({
        success: true,
        message: 'Xóa yêu cầu thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa yêu cầu'
      });
    }
  }
}
