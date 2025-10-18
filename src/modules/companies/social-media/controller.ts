import { Request, Response } from 'express';
import { CompanySocialMediaService } from './service.js';
import { createCompanySocialMediaDto, updateCompanySocialMediaDto } from './dto.js';
import { ResponseUtils } from '../../../utils/response.js';
import { AppError } from '../../../utils/error.js';
import { ErrorCode } from '../../../utils/error-codes.js';

const service = new CompanySocialMediaService();

export class CompanySocialMediaController {
  async create(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const data = createCompanySocialMediaDto.parse(req.body);
      const socialMedia = await service.createCompanySocialMedia(companyId, data);
      return ResponseUtils.created(res, socialMedia, 'Thêm mạng xã hội thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      if (error instanceof Error && error.name === 'ZodError') {
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      return ResponseUtils.internalError(res, 'Lỗi khi thêm mạng xã hội');
    }
  }

  async list(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const socialMedias = await service.getCompanySocialMedias(companyId);
      return ResponseUtils.success(res, socialMedias);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi lấy danh sách mạng xã hội');
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { companyId, id } = req.params;
      const socialMedia = await service.getCompanySocialMediaById(companyId, id);
      if (!socialMedia) {
        return ResponseUtils.notFound(res, 'Mạng xã hội không tồn tại');
      }
      return ResponseUtils.success(res, socialMedia);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi lấy thông tin mạng xã hội');
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { companyId, id } = req.params;
      const data = updateCompanySocialMediaDto.parse(req.body);
      const socialMedia = await service.updateCompanySocialMedia(companyId, id, data);
      return ResponseUtils.success(res, socialMedia, 'Cập nhật mạng xã hội thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      if (error instanceof Error && error.name === 'ZodError') {
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      return ResponseUtils.internalError(res, 'Lỗi khi cập nhật mạng xã hội');
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { companyId, id } = req.params;
      await service.deleteCompanySocialMedia(companyId, id);
      return ResponseUtils.success(res, null, 'Xóa mạng xã hội thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi xóa mạng xã hội');
    }
  }
}
