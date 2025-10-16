import type { Request, Response } from 'express';
import { UsersService } from './service.js';
import { CreateUserDto, UpdateUserDto } from './dto.js';

const service = new UsersService();

export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await service.list();
    res.json({ 
      success: true,
      data: users 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể lấy danh sách người dùng'
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
      message: 'Tạo người dùng thành công'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể tạo người dùng'
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await service.getById(req.params.id!);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Người dùng không tìm thấy' 
      });
    }
    res.json({ 
      success: true,
      data: user 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể lấy thông tin người dùng'
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const input = UpdateUserDto.parse(req.body);
    const user = await service.update(req.params.id!, input);
    res.json({ 
      success: true,
      data: user,
      message: 'Cập nhật người dùng thành công'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể cập nhật người dùng'
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id!);
    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Không thể xóa người dùng'
    });
  }
};

