import type { Request, Response } from 'express';
import { UsersService } from './service.js';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto.js';

const service = new UsersService();

export const listUsers = async (req: Request, res: Response) => {
  try {
    const query = UserQueryDto.parse(req.query);
    const result = await service.list(query);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể lấy danh sách người dùng',
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const input = CreateUserDto.parse(req.body);
    const user = await service.create(input);

    res.status(201).json({
      success: true,
      data: user,
      message: 'Tạo người dùng thành công',
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('đã tồn tại') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể tạo người dùng',
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await service.getById(req.params.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('không tồn tại') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể lấy thông tin người dùng',
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const input = UpdateUserDto.parse(req.body);
    const user = await service.update(req.params.id, input);

    res.json({
      success: true,
      data: user,
      message: 'Cập nhật người dùng thành công',
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('không tồn tại') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể cập nhật người dùng',
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id);

    res.json({
      success: true,
      message: 'Xóa người dùng thành công',
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('không tồn tại') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể xóa người dùng',
    });
  }
};

// Additional controllers
export const lockUser = async (req: Request, res: Response) => {
  try {
    const user = await service.lockUser(req.params.id);

    res.json({
      success: true,
      data: user,
      message: 'Khóa người dùng thành công',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể khóa người dùng',
    });
  }
};

export const unlockUser = async (req: Request, res: Response) => {
  try {
    const user = await service.unlockUser(req.params.id);

    res.json({
      success: true,
      data: user,
      message: 'Mở khóa người dùng thành công',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể mở khóa người dùng',
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const user = await service.verifyEmail(req.params.id);

    res.json({
      success: true,
      data: user,
      message: 'Xác thực email thành công',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể xác thực email',
    });
  }
};

// Profile management - /me endpoints
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

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể lấy thông tin profile',
    });
  }
};

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
    const sanitizedInput = { ...input };
    delete sanitizedInput.role;
    delete sanitizedInput.isActive;
    delete sanitizedInput.isLocked;
    delete sanitizedInput.isEmailVerified;
    delete sanitizedInput.companyId;

    const user = await service.update(userId, sanitizedInput);

    res.json({
      success: true,
      data: user,
      message: 'Cập nhật profile thành công',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể cập nhật profile',
    });
  }
};

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

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể đổi mật khẩu',
    });
  }
};
