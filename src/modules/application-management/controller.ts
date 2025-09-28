import { Request, Response } from 'express';
import { ApplicationManagementService } from './service.js';
import { createApplicationDto, updateApplicationStatusDto, addInternalNoteDto, getApplicationsDto } from './dto.js';

const applicationService = new ApplicationManagementService();

export class ApplicationManagementController {
  // Ứng viên ứng tuyển việc làm
  async createApplication(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = createApplicationDto.parse(req.body);
      const application = await applicationService.createApplication(userId, data);

      res.status(201).json({
        success: true,
        data: application
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create application'
      });
    }
  }

  // Lấy danh sách ứng tuyển cho nhà tuyển dụng
  async getApplicationsForRecruiter(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { companyId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters = getApplicationsDto.parse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      });

      const result = await applicationService.getApplicationsForRecruiter(companyId, userId, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch applications'
      });
    }
  }

  // Lấy danh sách ứng tuyển của ứng viên
  async getUserApplications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters = {
        status: req.query.status as "PENDING" | "REVIEWING" | "INTERVIEW" | "OFFER" | "REJECTED" | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };

      const result = await applicationService.getUserApplications(userId, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user applications'
      });
    }
  }

  // Cập nhật trạng thái ứng tuyển
  async updateApplicationStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { companyId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = updateApplicationStatusDto.parse(req.body);
      const application = await applicationService.updateApplicationStatus(companyId, userId, data);

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update application status'
      });
    }
  }

  // Thêm ghi chú nội bộ
  async addInternalNote(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { companyId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = addInternalNoteDto.parse(req.body);
      const note = await applicationService.addInternalNote(companyId, userId, data);

      res.status(201).json({
        success: true,
        data: note
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add internal note'
      });
    }
  }

  // Lấy chi tiết ứng viên
  async getCandidateDetails(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { companyId, candidateId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const candidate = await applicationService.getCandidateDetails(companyId, userId, candidateId);

      res.json({
        success: true,
        data: candidate
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch candidate details'
      });
    }
  }
}
