import { Request, Response } from 'express';
import { ReferenceService } from './service.js';
import { createReferenceDto, updateReferenceDto } from './dto.js';

const service = new ReferenceService();

export class ReferenceController {
  async create(req: Request, res: Response) {
    try {
      const { cvId } = req.params;
      const data = createReferenceDto.parse(req.body);
      const reference = await service.createReference(cvId, data);
      res.status(201).json({ 
        success: true,
        data: reference,
        message: 'Tạo Người giới thiệu thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tạo Người giới thiệu'
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { cvId } = req.params;
      const references = await service.getReferences(cvId);
      res.json({ 
        success: true,
        data: references 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy danh sách Người giới thiệu'
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      const reference = await service.getReferenceById(cvId, id);
      if (!reference) {
        return res.status(404).json({ 
          success: false,
          error: 'Người giới thiệu không tìm thấy' 
        });
      }
      res.json({ 
        success: true,
        data: reference 
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể lấy thông tin Người giới thiệu'
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      const data = updateReferenceDto.parse(req.body);
      const reference = await service.updateReference(cvId, id, data);
      res.json({ 
        success: true,
        data: reference,
        message: 'Cập nhật Người giới thiệu thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể cập nhật Người giới thiệu'
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { cvId, id } = req.params;
      await service.deleteReference(cvId, id);
      res.json({
        success: true,
        message: 'Xóa Người giới thiệu thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Không thể xóa Người giới thiệu'
      });
    }
  }
}
