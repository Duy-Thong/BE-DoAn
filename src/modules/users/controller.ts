import type { Request, Response } from 'express';
import { UsersService } from './service.js';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto.js';
import { ErrorUtils } from '../../utils/error.js';

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
