import type { Request, Response } from 'express';
import { UsersService } from './service.js';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto.js';
import { ResponseUtils } from '../../utils/response.js';
import { AppError } from '../../utils/error.js';
import { FirebaseStorageService } from '../../services/firebase-storage.js';
import { APP_CONSTANTS, USER_ROLES } from '../../utils/constants.js';

const service = new UsersService();

/**
 * Handle errors consistently using ResponseUtils
 */
const handleError = (error: unknown, res: Response) => {
  if (error instanceof AppError) {
    return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
  }
  
  if (error instanceof Error && error.name === 'ZodError') {
    return ResponseUtils.badRequest(res, 'Dữ liệu không hợp lệ');
  }
  
  return ResponseUtils.internalError(res, 'Có lỗi xảy ra');
};

// ========================================
// LIST USERS
// ========================================
export const listUsers = async (req: Request, res: Response) => {
  try {
    const query = UserQueryDto.parse(req.query);
    const result = await service.list(query);

    return ResponseUtils.paginated(res, result.data, result.pagination);
  } catch (error) {
    return handleError(error, res);
  }
};

// ========================================
// CREATE USER
// ========================================
export const createUser = async (req: Request, res: Response) => {
  try {
    const input = CreateUserDto.parse(req.body);
    const user = await service.create(input);

    return ResponseUtils.created(res, user, 'Tạo người dùng thành công');
  } catch (error) {
    return handleError(error, res);
  }
};

// ========================================
// GET USER
// ========================================
export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await service.getById(req.params.id);

    return ResponseUtils.success(res, user);
  } catch (error) {
    return handleError(error, res);
  }
};

// ========================================
// UPDATE USER
// ========================================
export const updateUser = async (req: Request, res: Response) => {
  try {
    const input = UpdateUserDto.parse(req.body);
    const user = await service.update(req.params.id, input);

    return ResponseUtils.success(res, user, 'Cập nhật người dùng thành công');
  } catch (error) {
    return handleError(error, res);
  }
};

// ========================================
// DELETE USER
// ========================================
export const deleteUser = async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id);

    return ResponseUtils.success(res, null, 'Xóa người dùng thành công');
  } catch (error) {
    return handleError(error, res);
  }
};

// ========================================
// LOCK USER
// ========================================
export const lockUser = async (req: Request, res: Response) => {
  try {
    const user = await service.lockUser(req.params.id);

    return ResponseUtils.success(res, user, 'Khóa người dùng thành công');
  } catch (error) {
    return handleError(error, res);
  }
};

// ========================================
// UNLOCK USER
// ========================================
export const unlockUser = async (req: Request, res: Response) => {
  try {
    const user = await service.unlockUser(req.params.id);

    return ResponseUtils.success(res, user, 'Mở khóa người dùng thành công');
  } catch (error) {
    return handleError(error, res);
  }
};

// ========================================
// VERIFY EMAIL
// ========================================
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const user = await service.verifyEmail(req.params.id);

    return ResponseUtils.success(res, user, 'Xác thực email thành công');
  } catch (error) {
    return handleError(error, res);
  }
};

// ========================================
// GET MY PROFILE
// ========================================
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseUtils.unauthorized(res, 'Không xác định được người dùng');
    }

    const user = await service.getById(userId);

    return ResponseUtils.success(res, user);
  } catch (error) {
    return handleError(error, res);
  }
};

// ========================================
// UPDATE MY PROFILE
// ========================================
export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseUtils.unauthorized(res, 'Không xác định được người dùng');
    }

    const input = UpdateUserDto.parse(req.body);

    // Prevent users from updating sensitive fields via this endpoint
    const { role, isActive, isLocked, isEmailVerified, companyId, ...sanitizedInput } = input;

    const user = await service.update(userId, sanitizedInput);

    return ResponseUtils.success(res, user, 'Cập nhật profile thành công');
  } catch (error) {
    return handleError(error, res);
  }
};

// ========================================
// CHANGE MY PASSWORD
// ========================================
export const changeMyPassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseUtils.unauthorized(res, 'Không xác định được người dùng');
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return ResponseUtils.badRequest(res, 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới');
    }

    await service.changePassword(userId, currentPassword, newPassword);

    return ResponseUtils.success(res, null, 'Đổi mật khẩu thành công');
  } catch (error) {
    return handleError(error, res);
  }
};

// ========================================
// UPLOAD MY AVATAR
// ========================================
export const uploadMyAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseUtils.unauthorized(res, 'Không xác định được người dùng');
    }

    if (!req.file) {
      return ResponseUtils.badRequest(res, 'Không có file được tải lên');
    }

    // Validate file type using constants
    if (!(APP_CONSTANTS.ALLOWED_IMAGE_TYPES as readonly string[]).includes(req.file.mimetype)) {
      return ResponseUtils.badRequest(res, `Loại file không được hỗ trợ. Chỉ chấp nhận: ${APP_CONSTANTS.ALLOWED_IMAGE_TYPES.join(', ')}`);
    }

    // Validate file size using constants
    if (req.file.size > APP_CONSTANTS.MAX_FILE_SIZE) {
      return ResponseUtils.badRequest(res, `File quá lớn. Kích thước tối đa là ${APP_CONSTANTS.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Get current user to check for existing avatar
    const currentUser = await service.getById(userId);
    const oldAvatarUrl = currentUser.avatarUrl;

    // Generate unique path for avatar
    const avatarPath = FirebaseStorageService.generateAvatarPath(userId, req.file.originalname);
    
    // Upload to Firebase Storage
    const avatarUrl = await FirebaseStorageService.uploadFile(req.file, avatarPath, {
      userId,
      type: 'avatar',
      uploadedAt: new Date().toISOString()
    });

    // Update user's avatar URL in database
    const user = await service.update(userId, { avatarUrl });

    // Delete old avatar from Firebase Storage if it exists and is from Firebase Storage
    if (oldAvatarUrl && oldAvatarUrl.includes('firebasestorage.googleapis.com')) {
      try {
        // Extract file path from Firebase Storage URL
        const url = new URL(oldAvatarUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
        if (pathMatch) {
          const oldFilePath = decodeURIComponent(pathMatch[1]);
          await FirebaseStorageService.deleteFile(oldFilePath);
        }
      } catch (deleteError) {
        // Log error but don't fail the upload
        console.warn('Failed to delete old avatar:', deleteError);
      }
    }

    return ResponseUtils.success(res, {
      avatarUrl,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    }, 'Tải lên avatar thành công');
  } catch (error) {
    return handleError(error, res);
  }
};

// ========================================
// DELETE MY AVATAR
// ========================================
export const deleteMyAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ResponseUtils.unauthorized(res, 'Không xác định được người dùng');
    }

    // Get current user to check for existing avatar
    const currentUser = await service.getById(userId);
    const oldAvatarUrl = currentUser.avatarUrl;

    // Update user's avatar URL to null in database
    const user = await service.update(userId, { avatarUrl: null });

    // Delete old avatar from Firebase Storage if it exists and is from Firebase Storage
    if (oldAvatarUrl && oldAvatarUrl.includes('firebasestorage.googleapis.com')) {
      try {
        // Extract file path from Firebase Storage URL
        const url = new URL(oldAvatarUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
        if (pathMatch) {
          const oldFilePath = decodeURIComponent(pathMatch[1]);
          await FirebaseStorageService.deleteFile(oldFilePath);
        }
      } catch (deleteError) {
        // Log error but don't fail the operation
        console.warn('Failed to delete old avatar:', deleteError);
      }
    }

    return ResponseUtils.success(res, {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    }, 'Xóa avatar thành công');
  } catch (error) {
    return handleError(error, res);
  }
};
