import type { Request, Response } from 'express';
import { UsersService } from './service.js';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto.js';
import { ErrorUtils } from '../../utils/error.js';
import { FirebaseStorageService } from '../../services/firebase-storage.js';

const service = new UsersService();

/**
 * Handle errors consistently using ErrorUtils
 */
const handleError = (error: unknown, res: Response) => {
  const appError = ErrorUtils.toAppError(error as Error);
  const errorResponse = ErrorUtils.createErrorResponse(appError);
  return res.status(appError.statusCode).json(errorResponse);
};

// ========================================
// LIST USERS
// ========================================
export const listUsers = async (req: Request, res: Response) => {
  try {
    const query = UserQueryDto.parse(req.query);
    const result = await service.list(query);

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
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

    return res.status(201).json({
      success: true,
      data: user,
      message: 'Tạo người dùng thành công',
    });
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

    return res.json({
      success: true,
      data: user,
    });
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

    return res.json({
      success: true,
      data: user,
      message: 'Cập nhật người dùng thành công',
    });
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

    return res.json({
      success: true,
      message: 'Xóa người dùng thành công',
    });
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

    return res.json({
      success: true,
      data: user,
      message: 'Khóa người dùng thành công',
    });
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

    return res.json({
      success: true,
      data: user,
      message: 'Mở khóa người dùng thành công',
    });
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

    return res.json({
      success: true,
      data: user,
      message: 'Xác thực email thành công',
    });
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
      return res.status(401).json({
        success: false,
        error: 'Không xác định được người dùng',
      });
    }

    const user = await service.getById(userId);

    return res.json({
      success: true,
      data: user,
    });
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
      return res.status(401).json({
        success: false,
        error: 'Không xác định được người dùng',
      });
    }

    const input = UpdateUserDto.parse(req.body);

    // Prevent users from updating sensitive fields via this endpoint
    // Use destructuring for type safety
    const { role, isActive, isLocked, isEmailVerified, companyId, ...sanitizedInput } = input;

    const user = await service.update(userId, sanitizedInput);

    return res.json({
      success: true,
      data: user,
      message: 'Cập nhật profile thành công',
    });
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
      return res.status(401).json({
        success: false,
        error: 'Không xác định được người dùng',
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới',
      });
    }

    await service.changePassword(userId, currentPassword, newPassword);

    return res.json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    });
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
      return res.status(401).json({
        success: false,
        error: 'Không xác định được người dùng',
      });
    }

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

    return res.json({
      success: true,
      data: {
        avatarUrl,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          avatarUrl: user.avatarUrl
        }
      },
      message: 'Tải lên avatar thành công',
    });
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
      return res.status(401).json({
        success: false,
        error: 'Không xác định được người dùng',
      });
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

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          avatarUrl: user.avatarUrl
        }
      },
      message: 'Xóa avatar thành công',
    });
  } catch (error) {
    return handleError(error, res);
  }
};
