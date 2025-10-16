import { Request, Response } from 'express';
import { JobBenefitService } from './service.js';
import { createJobBenefitDto, updateJobBenefitDto } from './dto.js';

const jobBenefitService = new JobBenefitService();

export class JobBenefitController {
  // Tạo phúc lợi công việc mới
  async createJobBenefit(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const data = createJobBenefitDto.parse(req.body);
      const benefit = await jobBenefitService.createJobBenefit(jobId, userId, data);

      res.status(201).json({
        success: true,
        data: benefit,
        message: 'Tạo phúc lợi công việc thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo phúc lợi công việc'
      });
    }
  }

  // Lấy danh sách phúc lợi
  async getJobBenefits(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const benefits = await jobBenefitService.getJobBenefits(jobId, userId);

      res.json({
        success: true,
        data: benefits
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách phúc lợi'
      });
    }
  }

  // Lấy phúc lợi theo ID
  async getJobBenefitById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId, benefitId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const benefit = await jobBenefitService.getJobBenefitById(benefitId, jobId, userId);

      if (!benefit) {
        return res.status(404).json({
          success: false,
          error: 'Phúc lợi không tìm thấy'
        });
      }

      res.json({
        success: true,
        data: benefit
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy phúc lợi'
      });
    }
  }

  // Cập nhật phúc lợi
  async updateJobBenefit(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId, benefitId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const data = updateJobBenefitDto.parse(req.body);
      const benefit = await jobBenefitService.updateJobBenefit(benefitId, jobId, userId, data);

      res.json({
        success: true,
        data: benefit,
        message: 'Cập nhật phúc lợi thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật phúc lợi'
      });
    }
  }

  // Xóa phúc lợi
  async deleteJobBenefit(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId, benefitId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      await jobBenefitService.deleteJobBenefit(benefitId, jobId, userId);

      res.json({
        success: true,
        message: 'Xóa phúc lợi thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa phúc lợi'
      });
    }
  }
}
