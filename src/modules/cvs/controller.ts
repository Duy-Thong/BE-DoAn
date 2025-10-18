import { Request, Response } from 'express';
import { CVService } from './service.js';
import { updateCompleteCVDto, setMainCVDto, createCompleteCVDto } from './dto.js';
import { ResponseUtils } from '../../utils/response.js';
import { AppError } from '../../utils/error.js';
import { ErrorCode } from '../../utils/error-codes.js';

const cvService = new CVService();

export class CVController {

  // Tạo CV hoàn chỉnh với tất cả thông tin
  async createCompleteCV(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ResponseUtils.unauthorized(res);
      }

      const data = createCompleteCVDto.parse(req.body);
      const cv = await cvService.createCompleteCV(userId, data);

      return ResponseUtils.created(res, cv, 'Tạo CV hoàn chỉnh thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      if (error instanceof Error && error.name === 'ZodError') {
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      return ResponseUtils.internalError(res, 'Lỗi khi tạo CV hoàn chỉnh');
    }
  }

  // Lấy danh sách CV của user
  async getUserCVs(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ResponseUtils.unauthorized(res);
      }

      const cvs = await cvService.getUserCVs(userId);
      return ResponseUtils.success(res, cvs);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi lấy danh sách CV');
    }
  }

  // Lấy CV theo ID
  async getCVById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;

      if (!userId) {
        return ResponseUtils.unauthorized(res);
      }

      const cv = await cvService.getCVById(cvId, userId);
      if (!cv) {
        return ResponseUtils.notFound(res, 'CV không tồn tại');
      }

      return ResponseUtils.success(res, cv);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi lấy thông tin CV');
    }
  }


  // Đặt CV làm CV chính
  async setMainCV(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtils.unauthorized(res);
      }

      const data = setMainCVDto.parse(req.body);
      const cv = await cvService.setMainCV(userId, data);

      return ResponseUtils.success(res, cv, 'Đặt CV chính thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      if (error instanceof Error && error.name === 'ZodError') {
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      return ResponseUtils.internalError(res, 'Lỗi khi đặt CV chính');
    }
  }

  // Xóa CV
  async deleteCV(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;

      if (!userId) {
        return ResponseUtils.unauthorized(res);
      }

      await cvService.deleteCV(cvId, userId);

      return ResponseUtils.success(res, null, 'Xóa CV thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      return ResponseUtils.internalError(res, 'Lỗi khi xóa CV');
    }
  }

  // Cập nhật CV hoàn chỉnh với nested data
  async updateCompleteCV(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;

      if (!userId) {
        return ResponseUtils.unauthorized(res);
      }

      const data = updateCompleteCVDto.parse(req.body);
      const cv = await cvService.updateCompleteCV(cvId, userId, data);

      return ResponseUtils.success(res, cv, 'Cập nhật CV hoàn chỉnh thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      if (error instanceof Error && error.name === 'ZodError') {
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      return ResponseUtils.internalError(res, 'Lỗi khi cập nhật CV hoàn chỉnh');
    }
  }

  // Lấy CV chính
  async getMainCV(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtils.unauthorized(res);
      }

      const cv = await cvService.getMainCV(userId);

      return ResponseUtils.success(res, cv);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      return ResponseUtils.internalError(res, 'Lỗi khi lấy CV chính');
    }
  }

  // Download CV
  async downloadCV(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;

      if (!userId) {
        return ResponseUtils.unauthorized(res);
      }

      const cvData = await cvService.downloadCV(cvId, userId);

      return ResponseUtils.success(res, cvData, 'Lấy thông tin CV để tải xuống thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      return ResponseUtils.internalError(res, 'Lỗi khi tải CV');
    }
  }
}
