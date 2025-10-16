import { Request, Response } from 'express';
import { NotificationService } from './service.js';
import { createNotificationDto, updateNotificationDto, markAsReadDto, bulkMarkAsReadDto } from './dto.js';

const service = new NotificationService();

export class NotificationController {
  async create(req: Request, res: Response) {
    try {
      const data = createNotificationDto.parse(req.body);
      const notification = await service.createNotification(data);
      res.status(201).json({ 
        success: true,
        data: notification,
        message: 'Tạo thông báo thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo thông báo'
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        type: req.query.type as string,
        isRead: req.query.isRead ? req.query.isRead === 'true' : undefined,
      };

      const result = await service.getNotifications(userId, options);
      res.json({ 
        success: true,
        data: result.notifications,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách thông báo'
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const { id } = req.params;
      const notification = await service.getNotificationById(userId, id);
      if (!notification) {
        return res.status(404).json({ 
          success: false,
          error: 'Thông báo không tìm thấy' 
        });
      }
      res.json({ 
        success: true,
        data: notification 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy thông tin thông báo'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const { id } = req.params;
      const data = updateNotificationDto.parse(req.body);
      const notification = await service.updateNotification(userId, id, data);
      res.json({ 
        success: true,
        data: notification,
        message: 'Cập nhật thông báo thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật thông báo'
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const { id } = req.params;
      await service.deleteNotification(userId, id);
      res.json({
        success: true,
        message: 'Xóa thông báo thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa thông báo'
      });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const { id } = req.params;
      const data = markAsReadDto.parse(req.body);
      const notification = await service.markAsRead(userId, id, data);
      res.json({ 
        success: true,
        data: notification,
        message: 'Đánh dấu thông báo thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể đánh dấu thông báo'
      });
    }
  }

  async bulkMarkAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const data = bulkMarkAsReadDto.parse(req.body);
      const result = await service.bulkMarkAsRead(userId, data);
      res.json({ 
        success: true,
        data: { count: result.count },
        message: 'Đánh dấu hàng loạt thông báo thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể đánh dấu hàng loạt thông báo'
      });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const result = await service.markAllAsRead(userId);
      res.json({ 
        success: true,
        data: { count: result.count },
        message: 'Đánh dấu tất cả thông báo thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể đánh dấu tất cả thông báo'
      });
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const count = await service.getUnreadCount(userId);
      res.json({ 
        success: true,
        data: { count }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy số lượng thông báo chưa đọc'
      });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const stats = await service.getNotificationStats(userId);
      res.json({ 
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy thống kê thông báo'
      });
    }
  }

  async deleteOld(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Không có quyền truy cập'
        });
      }

      const daysOld = parseInt(req.query.days as string) || 30;
      const result = await service.deleteOldNotifications(userId, daysOld);
      res.json({ 
        success: true,
        data: { count: result.count },
        message: 'Xóa thông báo cũ thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa thông báo cũ'
      });
    }
  }
}
