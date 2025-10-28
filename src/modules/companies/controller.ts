import type { Request, Response } from 'express';
import { CompaniesService } from './service.js';
import { CreateCompanyDto, UpdateCompanyDto, CompanyQueryDto } from './dto.js';
import { CompanyRole } from '../../generated/prisma/index.js';
import { ResponseUtils } from '../../utils/response.js';
import { AppError } from '../../utils/error.js';
import { FirebaseStorageService } from '../../services/firebase-storage.js';

/**
 * Companies Controller
 * Handles HTTP requests for company operations
 * Uses CompaniesService for business logic
 */
export class CompaniesController {
  private companiesService: CompaniesService;

  constructor() {
    this.companiesService = new CompaniesService();
  }

  // ========================================
  // ERROR HANDLING
  // ========================================
  private handleError(error: unknown, res: Response) {
    if (error instanceof AppError) {
      return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
    }

    if (error instanceof Error && error.name === 'ZodError') {
      return ResponseUtils.badRequest(res, 'Dữ liệu không hợp lệ');
    }

    return ResponseUtils.internalError(res, 'Có lỗi xảy ra');
  }
  // ========================================
  // LIST COMPANIES
  // ========================================
  async list(req: Request, res: Response) {
    try {
      const query = CompanyQueryDto.parse(req.query);
      const result = await this.companiesService.list(query);
      return ResponseUtils.paginated(res, result.data, result.pagination);
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // CREATE COMPANY
  // ========================================
  async create(req: Request, res: Response) {
    try {
      const input = CreateCompanyDto.parse(req.body);
      const company = await this.companiesService.create(input);
      return ResponseUtils.created(res, company, 'Tạo công ty thành công');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // GET COMPANY BY ID
  // ========================================
  async getById(req: Request, res: Response) {
    try {
      const company = await this.companiesService.getById(req.params.id);
      return ResponseUtils.success(res, company);
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // UPDATE COMPANY
  // ========================================
  async update(req: Request, res: Response) {
    try {
      const input = UpdateCompanyDto.parse(req.body);
      const company = await this.companiesService.update(req.params.id, input);
      return ResponseUtils.success(res, company, 'Cập nhật công ty thành công');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // DELETE COMPANY
  // ========================================
  async remove(req: Request, res: Response) {
    try {
      await this.companiesService.remove(req.params.id);
      return ResponseUtils.success(res, null, 'Xóa công ty thành công');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // COMPANY STATUS OPERATIONS
  // ========================================
  async verify(req: Request, res: Response) {
    try {
      const company = await this.companiesService.verifyCompany(req.params.id);
      return ResponseUtils.success(res, company, 'Xác thực công ty thành công');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async unverify(req: Request, res: Response) {
    try {
      const company = await this.companiesService.unverifyCompany(req.params.id);
      return ResponseUtils.success(res, company, 'Hủy xác thực công ty thành công');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async activate(req: Request, res: Response) {
    try {
      const company = await this.companiesService.activateCompany(req.params.id);
      return ResponseUtils.success(res, company, 'Kích hoạt công ty thành công');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async deactivate(req: Request, res: Response) {
    try {
      const company = await this.companiesService.deactivateCompany(req.params.id);
      return ResponseUtils.success(res, company, 'Vô hiệu hóa công ty thành công');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // COMPANY JOBS
  // ========================================
  async getJobs(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.companiesService.getCompanyJobs(req.params.id, page, limit);
      return ResponseUtils.paginated(res, result.data, result.pagination);
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // COMPANY USERS
  // ========================================
  async getUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.companiesService.getCompanyUsers(req.params.id, page, limit);
      return ResponseUtils.paginated(res, result.data, result.pagination);
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // USER MANAGEMENT
  // ========================================
  async assignUser(req: Request, res: Response) {
    try {
      const { userId, companyRole } = req.body;
      const user = await this.companiesService.assignUser(
        req.params.id,
        userId,
        companyRole || CompanyRole.VIEWER,
      );
      return ResponseUtils.success(res, user, 'Thêm thành viên thành công');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async removeUser(req: Request, res: Response) {
    try {
      const user = await this.companiesService.removeUser(req.params.id, req.params.userId);
      return ResponseUtils.success(res, user, 'Xóa thành viên thành công');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async updateUserRole(req: Request, res: Response) {
    try {
      const { companyRole } = req.body;
      if (!companyRole) {
        return ResponseUtils.badRequest(res, 'Vui lòng cung cấp companyRole');
      }

      const user = await this.companiesService.updateUserRole(req.params.id, req.params.userId, companyRole);
      return ResponseUtils.success(res, user, 'Cập nhật vai trò thành công');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // COMPANY LOGO MANAGEMENT
  // ========================================
  async uploadLogo(req: Request, res: Response) {
    try {
      const companyId = req.params.id;
      
      if (!req.file) {
        return ResponseUtils.badRequest(res, 'Không có file được tải lên');
      }

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return ResponseUtils.badRequest(res, 'Loại file không được hỗ trợ. Chỉ chấp nhận PNG, JPEG, JPG, WEBP');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        return ResponseUtils.badRequest(res, 'File quá lớn. Kích thước tối đa là 5MB');
      }

      // Get current company to check for existing logo
      const currentCompany = await this.companiesService.getById(companyId);
      const oldLogoUrl = currentCompany.logoUrl;

      // Generate unique path for logo
      const logoPath = FirebaseStorageService.generateLogoPath(companyId, req.file.originalname);
      
      // Upload to Firebase Storage
      const logoUrl = await FirebaseStorageService.uploadFile(req.file, logoPath, {
        companyId,
        type: 'logo',
        uploadedAt: new Date().toISOString()
      });

      // Update company's logo URL in database
      const company = await this.companiesService.update(companyId, { logoUrl });

      // Delete old logo from Firebase Storage if it exists and is from Firebase Storage
      if (oldLogoUrl && oldLogoUrl.includes('firebasestorage.googleapis.com')) {
        try {
          // Extract file path from Firebase Storage URL
          const url = new URL(oldLogoUrl);
          const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
          if (pathMatch) {
            const oldFilePath = decodeURIComponent(pathMatch[1]);
            await FirebaseStorageService.deleteFile(oldFilePath);
          }
        } catch (deleteError) {
          // Log error but don't fail the upload
          console.warn('Failed to delete old logo:', deleteError);
        }
      }

      return ResponseUtils.success(res, {
        logoUrl,
        company: {
          id: company.id,
          name: company.name,
          logoUrl: company.logoUrl
        }
      }, 'Tải lên logo thành công');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async deleteLogo(req: Request, res: Response) {
    try {
      const companyId = req.params.id;

      // Get current company to check for existing logo
      const currentCompany = await this.companiesService.getById(companyId);
      const oldLogoUrl = currentCompany.logoUrl;

      // Update company's logo URL to null in database
      const company = await this.companiesService.update(companyId, { logoUrl: null });

      // Delete old logo from Firebase Storage if it exists and is from Firebase Storage
      if (oldLogoUrl && oldLogoUrl.includes('firebasestorage.googleapis.com')) {
        try {
          // Extract file path from Firebase Storage URL
          const url = new URL(oldLogoUrl);
          const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
          if (pathMatch) {
            const oldFilePath = decodeURIComponent(pathMatch[1]);
            await FirebaseStorageService.deleteFile(oldFilePath);
          }
        } catch (deleteError) {
          // Log error but don't fail the operation
          console.warn('Failed to delete old logo:', deleteError);
        }
      }

      return ResponseUtils.success(res, {
        company: {
          id: company.id,
          name: company.name,
          logoUrl: company.logoUrl
        }
      }, 'Xóa logo thành công');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // COMPANY BANNER MANAGEMENT
  // ========================================
  async uploadBanner(req: Request, res: Response) {
    try {
      const companyId = req.params.id;
      
      if (!req.file) {
        return ResponseUtils.badRequest(res, 'Không có file được tải lên');
      }

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return ResponseUtils.badRequest(res, 'Loại file không được hỗ trợ. Chỉ chấp nhận PNG, JPEG, JPG, WEBP');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        return ResponseUtils.badRequest(res, 'File quá lớn. Kích thước tối đa là 5MB');
      }

      // Get current company to check for existing banner
      const currentCompany = await this.companiesService.getById(companyId);
      const oldBannerUrl = currentCompany.bannerUrl;

      // Generate unique path for banner
      const bannerPath = `banners/${companyId}/${Date.now()}.${req.file.originalname.split('.').pop()}`;
      
      // Upload to Firebase Storage
      const bannerUrl = await FirebaseStorageService.uploadFile(req.file, bannerPath, {
        companyId,
        type: 'banner',
        uploadedAt: new Date().toISOString()
      });

      // Update company's banner URL in database
      const company = await this.companiesService.update(companyId, { bannerUrl });

      // Delete old banner from Firebase Storage if it exists and is from Firebase Storage
      if (oldBannerUrl && oldBannerUrl.includes('firebasestorage.googleapis.com')) {
        try {
          // Extract file path from Firebase Storage URL
          const url = new URL(oldBannerUrl);
          const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
          if (pathMatch) {
            const oldFilePath = decodeURIComponent(pathMatch[1]);
            await FirebaseStorageService.deleteFile(oldFilePath);
          }
        } catch (deleteError) {
          // Log error but don't fail the upload
          console.warn('Failed to delete old banner:', deleteError);
        }
      }

      return ResponseUtils.success(res, {
        bannerUrl,
        company: {
          id: company.id,
          name: company.name,
          bannerUrl: company.bannerUrl
        }
      }, 'Tải lên banner thành công');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async deleteBanner(req: Request, res: Response) {
    try {
      const companyId = req.params.id;

      // Get current company to check for existing banner
      const currentCompany = await this.companiesService.getById(companyId);
      const oldBannerUrl = currentCompany.bannerUrl;

      // Update company's banner URL to null in database
      const company = await this.companiesService.update(companyId, { bannerUrl: null });

      // Delete old banner from Firebase Storage if it exists and is from Firebase Storage
      if (oldBannerUrl && oldBannerUrl.includes('firebasestorage.googleapis.com')) {
        try {
          // Extract file path from Firebase Storage URL
          const url = new URL(oldBannerUrl);
          const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
          if (pathMatch) {
            const oldFilePath = decodeURIComponent(pathMatch[1]);
            await FirebaseStorageService.deleteFile(oldFilePath);
          }
        } catch (deleteError) {
          // Log error but don't fail the operation
          console.warn('Failed to delete old banner:', deleteError);
        }
      }

      return ResponseUtils.success(res, {
        company: {
          id: company.id,
          name: company.name,
          bannerUrl: company.bannerUrl
        }
      }, 'Xóa banner thành công');
    } catch (error) {
      return this.handleError(error, res);
    }
  }
}
