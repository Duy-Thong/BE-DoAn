import { Request, Response } from 'express';
import { CertificationService } from './service.js';
import { createCertificationDto, updateCertificationDto } from './dto.js';

const service = new CertificationService();

export class CertificationController {
  async create(req: Request, res: Response) {
    try {
      const { cvId } = req.params;
      const data = createCertificationDto.parse(req.body);
      const certification = await service.createCertification(cvId, data);
      res.status(201).json({ 
        success: true,
        data: certification,
        message: 'Tạo chứng chỉ thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo chứng chỉ'
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { cvId } = req.params;
      const certifications = await service.getCertifications(cvId);
      res.json({ 
        success: true,
        data: certifications 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách chứng chỉ'
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      const certification = await service.getCertificationById(cvId, id);
      if (!certification) {
        return res.status(404).json({ 
          success: false,
          error: 'Chứng chỉ không tìm thấy' 
        });
      }
      res.json({ 
        success: true,
        data: certification 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy thông tin chứng chỉ'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      const data = updateCertificationDto.parse(req.body);
      const certification = await service.updateCertification(cvId, id, data);
      res.json({ 
        success: true,
        data: certification,
        message: 'Cập nhật chứng chỉ thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật chứng chỉ'
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      await service.deleteCertification(cvId, id);
      res.json({
        success: true,
        message: 'Xóa chứng chỉ thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa chứng chỉ'
      });
    }
  }
}
