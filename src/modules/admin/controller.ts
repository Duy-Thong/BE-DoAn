import { Request, Response } from 'express';
import { AdminService } from './service.js';
import { getUsersDto, updateUserStatusDto, deleteUserDto, getJobsDto, approveJobDto, getCompaniesDto, verifyCompanyDto } from './dto.js';

const adminService = new AdminService();

export class AdminController {
  // Lấy danh sách users
  async getUsers(req: Request, res: Response) {
    try {
      const filters = getUsersDto.parse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      });

      const result = await adminService.getUsers(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users'
      });
    }
  }

  // Cập nhật trạng thái user
  async updateUserStatus(req: Request, res: Response) {
    try {
      const data = updateUserStatusDto.parse(req.body);
      const user = await adminService.updateUserStatus(data);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user status'
      });
    }
  }

  // Xóa user
  async deleteUser(req: Request, res: Response) {
    try {
      const data = deleteUserDto.parse(req.body);
      const result = await adminService.deleteUser(data);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user'
      });
    }
  }

  // Lấy danh sách jobs
  async getJobs(req: Request, res: Response) {
    try {
      const filters = getJobsDto.parse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      });

      const result = await adminService.getJobs(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch jobs'
      });
    }
  }

  // Duyệt/từ chối job
  async approveJob(req: Request, res: Response) {
    try {
      const data = approveJobDto.parse(req.body);
      const job = await adminService.approveJob(data);

      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to approve job'
      });
    }
  }

  // Lấy danh sách companies
  async getCompanies(req: Request, res: Response) {
    try {
      const filters = getCompaniesDto.parse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      });

      const result = await adminService.getCompanies(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch companies'
      });
    }
  }

  // Xác minh company
  async verifyCompany(req: Request, res: Response) {
    try {
      const data = verifyCompanyDto.parse(req.body);
      const company = await adminService.verifyCompany(data);

      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify company'
      });
    }
  }

  // Lấy thống kê dashboard
  async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await adminService.getDashboardStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard stats'
      });
    }
  }
}
