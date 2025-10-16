import { Request, Response } from 'express';
import { JobAlertService } from './service.js';
import { CreateJobAlertDto, UpdateJobAlertDto } from './dto.js';

const jobAlertService = new JobAlertService();

export class JobAlertController {
  // Get all job alerts for user
  async getUserJobAlerts(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const alerts = await jobAlertService.getUserJobAlerts(userId);
      res.json({ 
        success: true,
        data: alerts 
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Không thể lấy danh sách thông báo việc làm'
      });
    }
  }

  // Get job alert by ID
  async getJobAlertById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const alert = await jobAlertService.getJobAlertById(id, userId);
      if (!alert) {
        return res.status(404).json({
          success: false,
          error: 'Thông báo việc làm không tìm thấy'
        });
      }

      res.json({ 
        success: true,
        data: alert 
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Không thể lấy thông báo việc làm'
      });
    }
  }

  // Create new job alert
  async createJobAlert(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const data = CreateJobAlertDto.parse(req.body);
      const alert = await jobAlertService.createJobAlert(userId, data);

      res.status(201).json({ 
        success: true,
        data: alert,
        message: 'Tạo thông báo việc làm thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Không thể tạo thông báo việc làm'
      });
    }
  }

  // Update job alert
  async updateJobAlert(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const data = UpdateJobAlertDto.parse(req.body);
      const alert = await jobAlertService.updateJobAlert(id, userId, data);

      res.json({ 
        success: true,
        data: alert,
        message: 'Cập nhật thông báo việc làm thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật thông báo việc làm'
      });
    }
  }

  // Delete job alert
  async deleteJobAlert(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      await jobAlertService.deleteJobAlert(id, userId);
      res.json({
        success: true,
        message: 'Xóa thông báo việc làm thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa thông báo việc làm'
      });
    }
  }

  // Toggle job alert active status
  async toggleJobAlert(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const alert = await jobAlertService.toggleJobAlert(id, userId);
      res.json({
        success: true,
        data: alert,
        message: `Đã ${alert.isActive ? 'kích hoạt' : 'tắt'} thông báo việc làm`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể thay đổi trạng thái thông báo việc làm'
      });
    }
  }
}
