import { Request, Response } from 'express';
import { LanguageService } from './service.js';
import { createLanguageDto, updateLanguageDto } from './dto.js';

const service = new LanguageService();

export class LanguageController {
  async create(req: Request, res: Response) {
    try {
      const { cvId } = req.params;
      const data = createLanguageDto.parse(req.body);
      const language = await service.createLanguage(cvId, data);
      res.status(201).json({ 
        success: true,
        data: language,
        message: 'Tạo thông tin ngôn ngữ thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo thông tin ngôn ngữ'
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { cvId } = req.params;
      const languages = await service.getLanguages(cvId);
      res.json({ 
        success: true,
        data: languages 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách ngôn ngữ'
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      const language = await service.getLanguageById(cvId, id);
      if (!language) {
        return res.status(404).json({ 
          success: false,
          error: 'Thông tin ngôn ngữ không tìm thấy' 
        });
      }
      res.json({ 
        success: true,
        data: language 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy thông tin ngôn ngữ'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      const data = updateLanguageDto.parse(req.body);
      const language = await service.updateLanguage(cvId, id, data);
      res.json({ 
        success: true,
        data: language,
        message: 'Cập nhật thông tin ngôn ngữ thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật thông tin ngôn ngữ'
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      await service.deleteLanguage(cvId, id);
      res.json({
        success: true,
        message: 'Xóa thông tin ngôn ngữ thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa thông tin ngôn ngữ'
      });
    }
  }
}
