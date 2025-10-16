import { Request, Response } from 'express';
import { CompanySocialMediaService } from './service.js';
import { createCompanySocialMediaDto, updateCompanySocialMediaDto } from './dto.js';

const service = new CompanySocialMediaService();

export class CompanySocialMediaController {
  async create(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const data = createCompanySocialMediaDto.parse(req.body);
      const socialMedia = await service.createCompanySocialMedia(companyId, data);
      res.status(201).json({ 
        success: true,
        data: socialMedia,
        message: 'Tạo mạng xã hội công ty thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo mạng xã hội công ty'
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const socialMedias = await service.getCompanySocialMedias(companyId);
      res.json({ 
        success: true,
        data: socialMedias 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách mạng xã hội công ty'
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { companyId, id } = req.params;
      const socialMedia = await service.getCompanySocialMediaById(companyId, id);
      if (!socialMedia) {
        return res.status(404).json({ 
          success: false,
          error: 'Mạng xã hội công ty không tìm thấy' 
        });
      }
      res.json({ 
        success: true,
        data: socialMedia 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy thông tin mạng xã hội công ty'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { companyId, id } = req.params;
      const data = updateCompanySocialMediaDto.parse(req.body);
      const socialMedia = await service.updateCompanySocialMedia(companyId, id, data);
      res.json({ 
        success: true,
        data: socialMedia,
        message: 'Cập nhật mạng xã hội công ty thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật mạng xã hội công ty'
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { companyId, id } = req.params;
      await service.deleteCompanySocialMedia(companyId, id);
      res.json({
        success: true,
        message: 'Xóa mạng xã hội công ty thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa mạng xã hội công ty'
      });
    }
  }
}
