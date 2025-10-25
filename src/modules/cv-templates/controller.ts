import { Request, Response } from 'express';
import { CVTemplateService } from './service.js';
import { ResponseUtils } from '../../utils/response.js';
import { ErrorCode } from '../../utils/error-codes.js';
import { AppError } from '../../utils/error.js';

const cvTemplateService = new CVTemplateService();

export class CVTemplateController {
  /**
   * Tạo CV template mới (Admin only)
   */
  async createTemplate(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ResponseUtils.unauthorized(res);
      }

      // Parse form data
      const data = {
        name: req.body.name,
        slug: req.body.slug,
        description: req.body.description || '',
        category: req.body.category,
        isActive: req.body.isActive === 'true',
        isDefault: req.body.isDefault === 'true',
        isPremium: req.body.isPremium === 'true',
        version: req.body.version || '1.0.0',
        author: req.body.author || '',
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      };

      // Get uploaded files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const htmlFile = files?.html?.[0];
      const previewFile = files?.preview?.[0];

      if (!htmlFile) {
        return ResponseUtils.error(res, 'File HTML là bắt buộc', 400, undefined, ErrorCode.VAL_REQUIRED_FIELD);
      }

      // Read HTML content
      const htmlContent = htmlFile.buffer.toString('utf-8');

      const template = await cvTemplateService.createTemplateWithFiles(
        data as any,
        htmlContent,
        previewFile?.buffer,
        previewFile?.mimetype,
        userId
      );

      return ResponseUtils.success(res, template, 'Tạo template thành công', 201);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      console.error('Create CV Template Error:', error);
      return ResponseUtils.internalError(res, 'Lỗi khi tạo template');
    }
  }

  /**
   * Cập nhật CV template (Admin only)
   * Có thể update metadata, HTML file, và/hoặc preview image
   */
  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return ResponseUtils.unauthorized(res);
      }

      // Parse form data (nếu có)
      const data: any = {};
      
      if (req.body.name) data.name = req.body.name;
      if (req.body.slug) data.slug = req.body.slug;
      if (req.body.description !== undefined) data.description = req.body.description;
      if (req.body.category) data.category = req.body.category;
      if (req.body.isActive !== undefined) data.isActive = req.body.isActive === 'true';
      if (req.body.isDefault !== undefined) data.isDefault = req.body.isDefault === 'true';
      if (req.body.isPremium !== undefined) data.isPremium = req.body.isPremium === 'true';
      if (req.body.version) data.version = req.body.version;
      if (req.body.author !== undefined) data.author = req.body.author;
      if (req.body.tags) data.tags = JSON.parse(req.body.tags);

      // Get uploaded files (nếu có)
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const htmlFile = files?.html?.[0];
      const previewFile = files?.preview?.[0];

      let htmlContent: string | undefined;
      if (htmlFile) {
        htmlContent = htmlFile.buffer.toString('utf-8');
      }

      const template = await cvTemplateService.updateTemplateWithFiles(
        id,
        data,
        htmlContent,
        previewFile?.buffer,
        previewFile?.mimetype,
        userId
      );

      return ResponseUtils.success(res, template, 'Cập nhật template thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      console.error('Update CV Template Error:', error);
      return ResponseUtils.internalError(res, 'Lỗi khi cập nhật template');
    }
  }

  /**
   * Lấy danh sách CV templates
   */
  async getTemplates(req: Request, res: Response) {
    try {
      // Parse query parameters with defaults
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string | undefined,
        category: req.query.category as string | undefined,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        isDefault: req.query.isDefault === 'true' ? true : req.query.isDefault === 'false' ? false : undefined,
        isPremium: req.query.isPremium === 'true' ? true : req.query.isPremium === 'false' ? false : undefined,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await cvTemplateService.getTemplates(query as any);
      return ResponseUtils.success(res, result, 'Lấy danh sách templates thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      console.error('Get CV Templates Error:', error);
      return ResponseUtils.internalError(res, 'Lỗi khi lấy danh sách templates');
    }
  }

  /**
   * Lấy CV template theo ID
   */
  async getTemplateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await cvTemplateService.getTemplateById(id);
      return ResponseUtils.success(res, template, 'Lấy template thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      console.error('Get CV Template Error:', error);
      return ResponseUtils.internalError(res, 'Lỗi khi lấy template');
    }
  }

  /**
   * Lấy CV template theo slug
   */
  async getTemplateBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const template = await cvTemplateService.getTemplateBySlug(slug);
      return ResponseUtils.success(res, template, 'Lấy template thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      console.error('Get CV Template Error:', error);
      return ResponseUtils.internalError(res, 'Lỗi khi lấy template');
    }
  }

  /**
   * Lấy template content để render CV
   */
  async getTemplateContent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const content = await cvTemplateService.getTemplateContent(id);
      return ResponseUtils.success(res, content, 'Lấy nội dung template thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      console.error('Get CV Template Content Error:', error);
      return ResponseUtils.internalError(res, 'Lỗi khi lấy nội dung template');
    }
  }

  /**
   * Xóa CV template (Admin only)
   */
  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await cvTemplateService.deleteTemplate(id);
      return ResponseUtils.success(res, null, 'Xóa template thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      console.error('Delete CV Template Error:', error);
      return ResponseUtils.internalError(res, 'Lỗi khi xóa template');
    }
  }

  /**
   * Cập nhật usage statistics
   */
  async updateTemplateUsage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { action } = req.body;

      await cvTemplateService.updateTemplateUsage({
        templateId: id,
        action,
      });

      return ResponseUtils.success(res, null, 'Cập nhật thống kê thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      console.error('Update Template Usage Error:', error);
      return ResponseUtils.internalError(res, 'Lỗi khi cập nhật thống kê');
    }
  }

  /**
   * Lấy template mặc định
   */
  async getDefaultTemplate(req: Request, res: Response) {
    try {
      const template = await cvTemplateService.getDefaultTemplate();
      return ResponseUtils.success(res, template, 'Lấy template mặc định thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      console.error('Get Default Template Error:', error);
      return ResponseUtils.internalError(res, 'Lỗi khi lấy template mặc định');
    }
  }


  /**
   * Lấy danh sách categories
   */
  async getCategories(req: Request, res: Response) {
    try {
      const categories = [
        { value: 'professional', label: 'Professional', description: 'Phù hợp cho công việc văn phòng' },
        { value: 'creative', label: 'Creative', description: 'Phù hợp cho ngành sáng tạo' },
        { value: 'academic', label: 'Academic', description: 'Phù hợp cho học thuật, nghiên cứu' },
        { value: 'minimal', label: 'Minimal', description: 'Thiết kế tối giản, sạch sẽ' },
        { value: 'modern', label: 'Modern', description: 'Thiết kế hiện đại, trendy' },
        { value: 'classic', label: 'Classic', description: 'Thiết kế cổ điển, truyền thống' },
      ];

      return ResponseUtils.success(res, categories, 'Lấy danh sách categories thành công');
    } catch (error) {
      console.error('Get Categories Error:', error);
      return ResponseUtils.internalError(res, 'Lỗi khi lấy danh sách categories');
    }
  }

  /**
   * Lấy thống kê templates
   */
  async getTemplateStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ResponseUtils.unauthorized(res);
      }

      // TODO: Implement template statistics
      const stats = {
        totalTemplates: 0,
        activeTemplates: 0,
        defaultTemplates: 0,
        premiumTemplates: 0,
        totalUsage: 0,
        totalDownloads: 0,
        categoryStats: {},
      };

      return ResponseUtils.success(res, stats, 'Lấy thống kê templates thành công');
    } catch (error) {
      console.error('Get Template Stats Error:', error);
      return ResponseUtils.internalError(res, 'Lỗi khi lấy thống kê templates');
    }
  }
}
