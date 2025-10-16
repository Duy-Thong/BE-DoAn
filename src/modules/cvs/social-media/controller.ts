import { Request, Response } from 'express';
import { SocialMediaService } from './service.js';
import { createSocialMediaDto, updateSocialMediaDto } from './dto.js';

const service = new SocialMediaService();

export class SocialMediaController {
  async create(req: Request, res: Response) {
    try {
      const { cvId } = req.params;
      const data = createSocialMediaDto.parse(req.body);
      const socialMedia = await service.createSocialMedia(cvId, data);
      res.status(201).json({ 
        success: true,
        data: socialMedia,
        message: 'Tạo mạng xã hội thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo mạng xã hội'
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { cvId } = req.params;
      const socialMedias = await service.getSocialMedias(cvId);
      res.json({ 
        success: true,
        data: socialMedias 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách mạng xã hội'
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      const socialMedia = await service.getSocialMediaById(cvId, id);
      if (!socialMedia) {
        return res.status(404).json({ 
          success: false,
          error: 'Mạng xã hội không tìm thấy' 
        });
      }
      res.json({ 
        success: true,
        data: socialMedia 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy thông tin mạng xã hội'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      const data = updateSocialMediaDto.parse(req.body);
      const socialMedia = await service.updateSocialMedia(cvId, id, data);
      res.json({ 
        success: true,
        data: socialMedia,
        message: 'Cập nhật mạng xã hội thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật mạng xã hội'
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      await service.deleteSocialMedia(cvId, id);
      res.json({
        success: true,
        message: 'Xóa mạng xã hội thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa mạng xã hội'
      });
    }
  }
}
