import type { Request, Response } from 'express';
import { CompaniesService } from './service.js';
import { CreateCompanyDto, UpdateCompanyDto, CompanyQueryDto } from './dto.js';
import { CompanyRole } from '../../generated/prisma/index.js';
import { ResponseUtils } from '../../utils/response.js';
import { AppError } from '../../utils/error.js';
import { ErrorCode } from '../../utils/error-codes.js';
import { FirebaseStorageService } from '../../services/firebase-storage.js';

const service = new CompaniesService();

export class CompaniesController {
  // List companies
  async list(req: Request, res: Response) {
    try {
      const query = CompanyQueryDto.parse(req.query);
      const result = await service.list(query);
      return ResponseUtils.success(res, result.data, undefined, 200);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      if (error instanceof Error && error.name === 'ZodError') {
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      return ResponseUtils.internalError(res, 'Lỗi khi lấy danh sách công ty');
    }
  }

  // Create company
  async create(req: Request, res: Response) {
    try {
      const input = CreateCompanyDto.parse(req.body);
      const company = await service.create(input);
      return ResponseUtils.created(res, company, 'Tạo công ty thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      if (error instanceof Error && error.name === 'ZodError') {
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      return ResponseUtils.internalError(res, 'Lỗi khi tạo công ty');
    }
  }

  // Get company by ID
  async getById(req: Request, res: Response) {
    try {
      const company = await service.getById(req.params.id);
      return ResponseUtils.success(res, company);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi lấy thông tin công ty');
    }
  }

  // Update company
  async update(req: Request, res: Response) {
    try {
      const input = UpdateCompanyDto.parse(req.body);
      const company = await service.update(req.params.id, input);
      return ResponseUtils.success(res, company, 'Cập nhật công ty thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      if (error instanceof Error && error.name === 'ZodError') {
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      return ResponseUtils.internalError(res, 'Lỗi khi cập nhật công ty');
    }
  }

  // Delete company
  async remove(req: Request, res: Response) {
    try {
      await service.remove(req.params.id);
      return ResponseUtils.success(res, null, 'Xóa công ty thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi xóa công ty');
    }
  }

  // Verify company
  async verify(req: Request, res: Response) {
    try {
      const company = await service.verifyCompany(req.params.id);
      return ResponseUtils.success(res, company, 'Xác thực công ty thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi xác thực công ty');
    }
  }

  // Unverify company
  async unverify(req: Request, res: Response) {
    try {
      const company = await service.unverifyCompany(req.params.id);
      return ResponseUtils.success(res, company, 'Hủy xác thực công ty thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi hủy xác thực công ty');
    }
  }

  // Activate company
  async activate(req: Request, res: Response) {
    try {
      const company = await service.activateCompany(req.params.id);
      return ResponseUtils.success(res, company, 'Kích hoạt công ty thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi kích hoạt công ty');
    }
  }

  // Deactivate company
  async deactivate(req: Request, res: Response) {
    try {
      const company = await service.deactivateCompany(req.params.id);
      return ResponseUtils.success(res, company, 'Vô hiệu hóa công ty thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi vô hiệu hóa công ty');
    }
  }

  // Get company jobs
  async getJobs(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await service.getCompanyJobs(req.params.id, page, limit);
      return ResponseUtils.success(res, result.data);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi lấy danh sách việc làm');
    }
  }

  // Get company users
  async getUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await service.getCompanyUsers(req.params.id, page, limit);
      return ResponseUtils.success(res, result.data);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi lấy danh sách thành viên');
    }
  }

  // Assign user to company
  async assignUser(req: Request, res: Response) {
    try {
      const { userId, companyRole } = req.body;
      const user = await service.assignUser(
        req.params.id,
        userId,
        companyRole || CompanyRole.VIEWER,
      );
      return ResponseUtils.success(res, user, 'Thêm thành viên thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi thêm thành viên');
    }
  }

  // Remove user from company
  async removeUser(req: Request, res: Response) {
    try {
      const user = await service.removeUser(req.params.id, req.params.userId);
      return ResponseUtils.success(res, user, 'Xóa thành viên thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi xóa thành viên');
    }
  }

  // Update user role
  async updateUserRole(req: Request, res: Response) {
    try {
      const { companyRole } = req.body;
      if (!companyRole) {
        return ResponseUtils.error(res, 'Vui lòng cung cấp companyRole', 400, undefined, ErrorCode.VAL_REQUIRED_FIELD);
      }

      const user = await service.updateUserRole(req.params.id, req.params.userId, companyRole);
      return ResponseUtils.success(res, user, 'Cập nhật vai trò thành công');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi cập nhật vai trò');
    }
  }

  // Upload company logo
  async uploadLogo(req: Request, res: Response) {
    try {
      const companyId = req.params.id;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Không có file được tải lên',
        });
      }

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Loại file không được hỗ trợ. Chỉ chấp nhận PNG, JPEG, JPG, WEBP',
        });
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        return res.status(400).json({
          success: false,
          error: 'File quá lớn. Kích thước tối đa là 5MB',
        });
      }

      // Get current company to check for existing logo
      const currentCompany = await service.getById(companyId);
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
      const company = await service.update(companyId, { logoUrl });

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

      return res.json({
        success: true,
        data: {
          logoUrl,
          company: {
            id: company.id,
            name: company.name,
            logoUrl: company.logoUrl
          }
        },
        message: 'Tải lên logo thành công',
      });
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi tải lên logo');
    }
  }

  // Delete company logo
  async deleteLogo(req: Request, res: Response) {
    try {
      const companyId = req.params.id;

      // Get current company to check for existing logo
      const currentCompany = await service.getById(companyId);
      const oldLogoUrl = currentCompany.logoUrl;

      // Update company's logo URL to null in database
      const company = await service.update(companyId, { logoUrl: null });

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

      return res.json({
        success: true,
        data: {
          company: {
            id: company.id,
            name: company.name,
            logoUrl: company.logoUrl
          }
        },
        message: 'Xóa logo thành công',
      });
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi xóa logo');
    }
  }

  // Upload company banner
  async uploadBanner(req: Request, res: Response) {
    try {
      const companyId = req.params.id;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Không có file được tải lên',
        });
      }

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Loại file không được hỗ trợ. Chỉ chấp nhận PNG, JPEG, JPG, WEBP',
        });
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        return res.status(400).json({
          success: false,
          error: 'File quá lớn. Kích thước tối đa là 5MB',
        });
      }

      // Get current company to check for existing banner
      const currentCompany = await service.getById(companyId);
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
      const company = await service.update(companyId, { bannerUrl });

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

      return res.json({
        success: true,
        data: {
          bannerUrl,
          company: {
            id: company.id,
            name: company.name,
            bannerUrl: company.bannerUrl
          }
        },
        message: 'Tải lên banner thành công',
      });
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi tải lên banner');
    }
  }

  // Delete company banner
  async deleteBanner(req: Request, res: Response) {
    try {
      const companyId = req.params.id;

      // Get current company to check for existing banner
      const currentCompany = await service.getById(companyId);
      const oldBannerUrl = currentCompany.bannerUrl;

      // Update company's banner URL to null in database
      const company = await service.update(companyId, { bannerUrl: null });

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

      return res.json({
        success: true,
        data: {
          company: {
            id: company.id,
            name: company.name,
            bannerUrl: company.bannerUrl
          }
        },
        message: 'Xóa banner thành công',
      });
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }
      return ResponseUtils.internalError(res, 'Lỗi khi xóa banner');
    }
  }
}
