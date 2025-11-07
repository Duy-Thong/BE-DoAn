import { Request, Response } from 'express';
import { CVService } from './service.js';
import { updateCompleteCVDto, setMainCVDto, createCompleteCVDto, duplicateCVDto } from './dto.js';
import { ResponseUtils } from '../../utils/response.js';
import { AppError } from '../../utils/error.js';
import { ErrorCode } from '../../utils/error-codes.js';
import { pdfGeneratorService, PDFGenerationOptions, CVWithNestedData } from '../../services/pdf/pdf-generator.service.js';

const cvService = new CVService();

/**
 * Sanitize filename để loại bỏ ký tự không hợp lệ trong HTTP header
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Loại bỏ control characters
    .replace(/[<>:"/\\|?*]/g, '') // Loại bỏ ký tự đặc biệt không hợp lệ cho filename
    .replace(/\s+/g, '_') // Thay space bằng underscore
    .replace(/[^\w\-_.]/g, '') // Chỉ giữ lại alphanumeric, dash, underscore, dot
    .substring(0, 200); // Giới hạn độ dài
}

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
        const zodError = error as any;
        const validationErrors = zodError.issues?.map((issue: any) => ({
          path: issue.path.join('.'),
          message: issue.message,
          received: issue.received
        }));
        console.error('Validation errors:', JSON.stringify(validationErrors, null, 2));
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, validationErrors, ErrorCode.VAL_INVALID_FORMAT);
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

  // Download CV as PDF
  async downloadCV(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;
      const { template = 'default', format = 'A4' } = req.query;

      if (!userId) {
        return ResponseUtils.unauthorized(res);
      }

      // Lấy CV data với tất cả nested data
            const cvData = await cvService.getCVById(cvId, userId) as unknown as CVWithNestedData;
      if (!cvData) {
        return ResponseUtils.error(res, 'CV không tồn tại', 404, undefined, ErrorCode.BIZ_CV_NOT_FOUND);
      }

      // Kiểm tra template có tồn tại không
      const templateExists = await pdfGeneratorService.templateExists(template as string);
      if (!templateExists) {
        return ResponseUtils.error(res, 'Template không tồn tại', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      // Tạo PDF
      const pdfOptions: PDFGenerationOptions = {
        template: template as string,
        format: format as 'A4' | 'Letter',
        printBackground: true
      };

      const pdfBuffer = await pdfGeneratorService.generateCVPDF(cvData, pdfOptions);

      // Set headers cho PDF download
      const safeFileName = sanitizeFileName(cvData.fullName || 'CV');
      const fileName = `${safeFileName}_CV.pdf`;
      
      // Sử dụng RFC 5987 encoding cho filename với ký tự đặc biệt
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`);
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.send(pdfBuffer);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      // Log chi tiết lỗi
      console.error('PDF Generation Error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }

      // Trả về message lỗi chi tiết hơn
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tạo PDF';
      return ResponseUtils.internalError(res, errorMessage);
    }
  }

  // Download Main CV as PDF
  async downloadMainCV(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { template = 'default', format = 'A4' } = req.query;

      if (!userId) {
        return ResponseUtils.unauthorized(res);
      }

      // Lấy main CV data
      const cvData = await cvService.getMainCV(userId) as unknown as CVWithNestedData;
      if (!cvData) {
        return ResponseUtils.error(res, 'Không tìm thấy CV chính', 404, undefined, ErrorCode.BIZ_CV_NOT_FOUND);
      }

      // Kiểm tra template có tồn tại không
      const templateExists = await pdfGeneratorService.templateExists(template as string);
      if (!templateExists) {
        return ResponseUtils.error(res, 'Template không tồn tại', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      // Tạo PDF
      const pdfOptions: PDFGenerationOptions = {
        template: template as string,
        format: format as 'A4' | 'Letter',
        printBackground: true
      };

      const pdfBuffer = await pdfGeneratorService.generateCVPDF(cvData, pdfOptions);

      // Set headers cho PDF download
      const safeFileName = sanitizeFileName(cvData.fullName || 'CV');
      const fileName = `${safeFileName}_Main_CV.pdf`;
      
      // Sử dụng RFC 5987 encoding cho filename với ký tự đặc biệt
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`);
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.send(pdfBuffer);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      console.error('PDF Generation Error:', error);
      return ResponseUtils.internalError(res, 'Lỗi khi tạo PDF');
    }
  }

  // Get available templates
  async getTemplates(req: Request, res: Response) {
    try {
      const templates = await pdfGeneratorService.getAvailableTemplates();
      return ResponseUtils.success(res, { templates }, 'Lấy danh sách templates thành công');
    } catch (error) {
      return ResponseUtils.internalError(res, 'Lỗi khi lấy danh sách templates');
    }
  }

  // Duplicate CV
  async duplicateCV(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { cvId } = req.params;

      if (!userId) {
        return ResponseUtils.unauthorized(res);
      }

      const data = duplicateCVDto.parse(req.body);
      const duplicatedCV = await cvService.duplicateCV(cvId, userId, data.title);

      return ResponseUtils.created(res, duplicatedCV, 'Sao chép CV thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      if (error instanceof Error && error.name === 'ZodError') {
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      return ResponseUtils.internalError(res, 'Lỗi khi sao chép CV');
    }
  }
}
