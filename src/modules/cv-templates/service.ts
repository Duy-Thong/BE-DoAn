import { PrismaClient } from '../../generated/prisma/index.js';
import { 
  CreateCVTemplateDto, 
  UpdateCVTemplateDto, 
  CVTemplateQueryDto,
  CVTemplateResponseDto,
  CVTemplateContentDto,
  CVTemplateUsageDto
} from './dto.js';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/error.js';
import { FirebaseStorageService } from '../../services/firebase-storage.js';

export class CVTemplateService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Tạo CV template mới với HTML file và preview image
   */
  async createTemplateWithFiles(
    data: CreateCVTemplateDto,
    htmlContent: string,
    previewBuffer?: Buffer,
    previewMimeType?: string,
    createdBy?: string
  ): Promise<CVTemplateResponseDto> {
    // Kiểm tra slug đã tồn tại chưa
    const existingTemplate = await this.prisma.cVTemplate.findUnique({
      where: { slug: data.slug }
    });

    if (existingTemplate) {
      throw new ConflictError(`Template với slug "${data.slug}" đã tồn tại`);
    }

    // Kiểm tra nếu set isDefault = true, thì phải set các template khác thành false
    if (data.isDefault) {
      await this.prisma.cVTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    // Upload HTML file
    const htmlFileName = `templates/${data.slug}/template.html`;
    const htmlUrl = await FirebaseStorageService.uploadString(
      htmlContent,
      htmlFileName,
      'text/html'
    );

    // Upload preview image (nếu có)
    let previewUrl: string | undefined;
    if (previewBuffer && previewMimeType) {
      const previewFileName = `templates/${data.slug}/preview.${previewMimeType.split('/')[1]}`;
      previewUrl = await FirebaseStorageService.uploadBuffer(
        previewBuffer,
        previewFileName,
        previewMimeType
      );
    }

    // Tạo template record
    const template = await this.prisma.cVTemplate.create({
      data: {
        ...data,
        htmlUrl,
        previewUrl: previewUrl || data.previewUrl || '',
        createdBy: createdBy || 'system',
      },
    });

    return this.mapToResponseDto(template);
  }

  /**
   * Tạo CV template mới (legacy - không có files)
   */
  async createTemplate(data: CreateCVTemplateDto, createdBy: string): Promise<CVTemplateResponseDto> {
    // Kiểm tra slug đã tồn tại chưa
    const existingTemplate = await this.prisma.cVTemplate.findUnique({
      where: { slug: data.slug }
    });

    if (existingTemplate) {
      throw new ConflictError(`Template với slug "${data.slug}" đã tồn tại`);
    }

    // Kiểm tra nếu set isDefault = true, thì phải set các template khác thành false
    if (data.isDefault) {
      await this.prisma.cVTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    // Tạo template record trước (chưa có htmlUrl)
    const template = await this.prisma.cVTemplate.create({
      data: {
        ...data,
        createdBy,
        htmlUrl: '', // Sẽ được cập nhật sau khi upload file
      },
    });

    return this.mapToResponseDto(template);
  }

  /**
   * Cập nhật CV template với files (HTML và/hoặc preview image)
   */
  async updateTemplateWithFiles(
    id: string,
    data: UpdateCVTemplateDto,
    htmlContent?: string,
    previewBuffer?: Buffer,
    previewMimeType?: string,
    updatedBy?: string
  ): Promise<CVTemplateResponseDto> {
    const existingTemplate = await this.prisma.cVTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      throw new NotFoundError('Template không tồn tại');
    }

    // Kiểm tra slug conflict nếu có thay đổi slug
    if (data.slug && data.slug !== existingTemplate.slug) {
      const slugExists = await this.prisma.cVTemplate.findUnique({
        where: { slug: data.slug }
      });

      if (slugExists) {
        throw new ConflictError(`Template với slug "${data.slug}" đã tồn tại`);
      }
    }

    // Kiểm tra nếu set isDefault = true, thì phải set các template khác thành false
    if (data.isDefault && !existingTemplate.isDefault) {
      await this.prisma.cVTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    let htmlUrl = existingTemplate.htmlUrl;
    let previewUrl = existingTemplate.previewUrl;

    // Upload HTML file mới (nếu có)
    if (htmlContent) {
      const htmlFileName = `templates/${data.slug || existingTemplate.slug}/template.html`;
      htmlUrl = await FirebaseStorageService.uploadString(
        htmlContent,
        htmlFileName,
        'text/html'
      );
    }

    // Upload preview image mới (nếu có)
    if (previewBuffer && previewMimeType) {
      const previewFileName = `templates/${data.slug || existingTemplate.slug}/preview.${previewMimeType.split('/')[1]}`;
      previewUrl = await FirebaseStorageService.uploadBuffer(
        previewBuffer,
        previewFileName,
        previewMimeType
      );
    }

    // Update template
    const updatedTemplate = await this.prisma.cVTemplate.update({
      where: { id },
      data: {
        ...data,
        htmlUrl,
        previewUrl,
        updatedBy: updatedBy || existingTemplate.updatedBy,
      },
    });

    return this.mapToResponseDto(updatedTemplate);
  }

  /**
   * Cập nhật CV template (legacy)
   */
  async updateTemplate(
    id: string, 
    data: UpdateCVTemplateDto, 
    updatedBy: string
  ): Promise<CVTemplateResponseDto> {
    const existingTemplate = await this.prisma.cVTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      throw new NotFoundError('Template không tồn tại');
    }

    // Kiểm tra slug conflict nếu có thay đổi slug
    if (data.slug && data.slug !== existingTemplate.slug) {
      const slugExists = await this.prisma.cVTemplate.findUnique({
        where: { slug: data.slug }
      });

      if (slugExists) {
        throw new ConflictError(`Template với slug "${data.slug}" đã tồn tại`);
      }
    }

    // Kiểm tra nếu set isDefault = true, thì phải set các template khác thành false
    if (data.isDefault && !existingTemplate.isDefault) {
      await this.prisma.cVTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    // Upload files to Firebase Storage nếu có thay đổi content
    let htmlUrl = existingTemplate.htmlUrl;
    let cssUrl = existingTemplate.cssUrl;
    let jsUrl = existingTemplate.jsUrl;

    try {
      if (data.htmlContent) {
        const htmlFileName = `templates/${data.slug || existingTemplate.slug}/template.html`;
        htmlUrl = await FirebaseStorageService.uploadString(
          data.htmlContent,
          htmlFileName,
          'text/html'
        );
      }

      if (data.cssContent !== undefined) {
        if (data.cssContent && data.cssContent.trim()) {
          const cssFileName = `templates/${data.slug || existingTemplate.slug}/style.css`;
          cssUrl = await FirebaseStorageService.uploadString(
            data.cssContent,
            cssFileName,
            'text/css'
          );
        } else {
          cssUrl = null;
        }
      }

      if (data.jsContent !== undefined) {
        if (data.jsContent && data.jsContent.trim()) {
          const jsFileName = `templates/${data.slug || existingTemplate.slug}/script.js`;
          jsUrl = await FirebaseStorageService.uploadString(
            data.jsContent,
            jsFileName,
            'application/javascript'
          );
        } else {
          jsUrl = null;
        }
      }
    } catch (error) {
      console.error('Error uploading updated template files to Firebase:', error);
      // Không throw error, chỉ log và tiếp tục với local content
    }

    const updatedTemplate = await this.prisma.cVTemplate.update({
      where: { id },
      data: {
        ...data,
        updatedBy,
        htmlUrl,
        cssUrl,
        jsUrl,
      },
    });

    return this.mapToResponseDto(updatedTemplate);
  }

  /**
   * Lấy danh sách CV templates với filter
   */
  async getTemplates(query: CVTemplateQueryDto): Promise<{
    templates: CVTemplateResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, search, category, isActive, isDefault, isPremium, tags, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isDefault !== undefined) {
      where.isDefault = isDefault;
    }

    if (isPremium !== undefined) {
      where.isPremium = isPremium;
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [templates, total] = await Promise.all([
      this.prisma.cVTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          category: true,
          isActive: true,
          isDefault: true,
          isPremium: true,
          version: true,
          author: true,
          tags: true,
          usageCount: true,
          downloadCount: true,
          previewUrl: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          updatedBy: true,
        },
      }),
      this.prisma.cVTemplate.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      templates: templates.map(template => this.mapToResponseDto(template)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Lấy CV template theo ID
   */
  async getTemplateById(id: string): Promise<CVTemplateResponseDto> {
    const template = await this.prisma.cVTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundError('Template không tồn tại');
    }

    return this.mapToResponseDto(template);
  }

  /**
   * Lấy CV template theo slug
   */
  async getTemplateBySlug(slug: string): Promise<CVTemplateResponseDto> {
    const template = await this.prisma.cVTemplate.findUnique({
      where: { slug },
    });

    if (!template) {
      throw new NotFoundError('Template không tồn tại');
    }

    return this.mapToResponseDto(template);
  }

  /**
   * Lấy template content (HTML) để render
   */
  async getTemplateContent(id: string): Promise<{
    id: string;
    name: string;
    slug: string;
    htmlContent: string;
    htmlUrl: string;
    previewUrl: string | null;
  }> {
    const template = await this.prisma.cVTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundError('Template không tồn tại');
    }

    if (!template.isActive) {
      throw new ValidationError('Template không khả dụng');
    }

    if (!template.htmlUrl) {
      throw new ValidationError('Template chưa có file HTML');
    }

    // Load HTML content từ Firebase Storage
    let htmlContent: string;
    try {
      htmlContent = await FirebaseStorageService.downloadString(template.htmlUrl);
    } catch (error) {
      console.error('Error loading HTML from Firebase:', error);
      throw new ValidationError('Không thể tải nội dung template');
    }

    return {
      id: template.id,
      name: template.name,
      slug: template.slug,
      htmlContent,
      htmlUrl: template.htmlUrl,
      previewUrl: template.previewUrl,
    };
  }

  /**
   * Xóa CV template
   */
  async deleteTemplate(id: string): Promise<void> {
    const template = await this.prisma.cVTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundError('Template không tồn tại');
    }

    // Không cho phép xóa template mặc định
    if (template.isDefault) {
      throw new ValidationError('Không thể xóa template mặc định');
    }

    // Xóa files từ Firebase Storage
    try {
      if (template.htmlUrl) {
        await FirebaseStorageService.deleteFile(template.htmlUrl);
      }
      if (template.cssUrl) {
        await FirebaseStorageService.deleteFile(template.cssUrl);
      }
      if (template.jsUrl) {
        await FirebaseStorageService.deleteFile(template.jsUrl);
      }
    } catch (error) {
      console.error('Error deleting template files from Firebase:', error);
      // Tiếp tục xóa record dù có lỗi Firebase
    }

    await this.prisma.cVTemplate.delete({
      where: { id },
    });
  }

  /**
   * Cập nhật usage statistics
   */
  async updateTemplateUsage(data: CVTemplateUsageDto): Promise<void> {
    const template = await this.prisma.cVTemplate.findUnique({
      where: { id: data.templateId },
    });

    if (!template) {
      throw new NotFoundError('Template không tồn tại');
    }

    const updateData: any = {};

    switch (data.action) {
      case 'view':
        updateData.usageCount = { increment: 1 };
        break;
      case 'download':
        updateData.downloadCount = { increment: 1 };
        break;
      case 'use':
        updateData.usageCount = { increment: 1 };
        updateData.downloadCount = { increment: 1 };
        break;
    }

    await this.prisma.cVTemplate.update({
      where: { id: data.templateId },
      data: updateData,
    });
  }

  /**
   * Lấy template mặc định
   */
  async getDefaultTemplate(): Promise<CVTemplateResponseDto> {
    const template = await this.prisma.cVTemplate.findFirst({
      where: { 
        isDefault: true,
        isActive: true 
      },
    });

    if (!template) {
      // Fallback to first active template
      const fallbackTemplate = await this.prisma.cVTemplate.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });

      if (!fallbackTemplate) {
        throw new NotFoundError('Không tìm thấy template nào');
      }

      return this.mapToResponseDto(fallbackTemplate);
    }

    return this.mapToResponseDto(template);
  }

  /**
   * Upload HTML file cho template
   */
  async uploadHTMLFile(templateId: string, htmlContent: string): Promise<string> {
    const template = await this.prisma.cVTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundError('Template không tồn tại');
    }

    const fileName = `templates/${template.slug}/template.html`;
    const htmlUrl = await FirebaseStorageService.uploadString(
      htmlContent,
      fileName,
      'text/html'
    );

    await this.prisma.cVTemplate.update({
      where: { id: templateId },
      data: { htmlUrl },
    });

    return htmlUrl;
  }

  /**
   * Upload preview image cho template
   */
  async uploadPreviewImage(templateId: string, imageBuffer: Buffer, mimeType: string): Promise<string> {
    const template = await this.prisma.cVTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundError('Template không tồn tại');
    }

    const fileName = `templates/${template.slug}/preview.${mimeType.split('/')[1]}`;
    const previewUrl = await FirebaseStorageService.uploadBuffer(
      imageBuffer,
      fileName,
      mimeType
    );

    await this.prisma.cVTemplate.update({
      where: { id: templateId },
      data: { previewUrl },
    });

    return previewUrl;
  }

  /**
   * Map database record to response DTO
   */
  private mapToResponseDto(template: any): CVTemplateResponseDto {
    return {
      id: template.id,
      name: template.name,
      slug: template.slug,
      description: template.description,
      category: template.category,
      isActive: template.isActive,
      isDefault: template.isDefault,
      isPremium: template.isPremium,
      version: template.version,
      author: template.author,
      tags: template.tags,
      htmlUrl: template.htmlUrl,
      cssUrl: template.cssUrl,
      jsUrl: template.jsUrl,
      previewUrl: template.previewUrl,
      usageCount: template.usageCount,
      downloadCount: template.downloadCount,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      createdBy: template.createdBy,
      updatedBy: template.updatedBy,
    };
  }
}
