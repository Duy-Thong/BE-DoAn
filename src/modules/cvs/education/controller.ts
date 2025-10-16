import { Request, Response } from 'express';
import { EducationService } from './service.js';
import { createEducationDto, updateEducationDto } from './dto.js';

const service = new EducationService();

export class EducationController {
  async create(req: Request, res: Response) {
    try {
      const { cvId } = req.params;
      const data = createEducationDto.parse(req.body);
      const education = await service.createEducation(cvId, data);
      res.status(201).json({ 
        success: true,
        data: education,
        message: 'Tạo thông tin học vấn thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo thông tin học vấn'
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { cvId } = req.params;
      const educations = await service.getEducations(cvId);
      res.json({ 
        success: true,
        data: educations 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách học vấn'
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      const education = await service.getEducationById(cvId, id);
      if (!education) {
        return res.status(404).json({ 
          success: false,
          error: 'Thông tin học vấn không tìm thấy' 
        });
      }
      res.json({ 
        success: true,
        data: education 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy thông tin học vấn'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      const data = updateEducationDto.parse(req.body);
      const education = await service.updateEducation(cvId, id, data);
      res.json({ 
        success: true,
        data: education,
        message: 'Cập nhật thông tin học vấn thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật thông tin học vấn'
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      await service.deleteEducation(cvId, id);
      res.json({
        success: true,
        message: 'Xóa thông tin học vấn thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa thông tin học vấn'
      });
    }
  }
}
