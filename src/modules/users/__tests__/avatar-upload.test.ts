import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { uploadMyAvatar } from '../controller.js';
import { FirebaseStorageService } from '../../../services/firebase-storage.js';

// Mock Firebase Storage Service
jest.mock('../../../services/firebase-storage.js', () => ({
  FirebaseStorageService: {
    generateAvatarPath: jest.fn(),
    uploadFile: jest.fn(),
  },
}));

// Mock UsersService
jest.mock('../service.js', () => ({
  UsersService: jest.fn().mockImplementation(() => ({
    update: jest.fn(),
  })),
}));

describe('Avatar Upload API', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      user: { id: 'test-user-id' },
      file: {
        originalname: 'test-avatar.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from('fake-image-data'),
      } as Express.Multer.File,
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should upload avatar successfully', async () => {
    // Mock Firebase Storage Service methods
    const mockAvatarPath = 'avatars/test-user-id/1234567890.jpg';
    const mockAvatarUrl = 'https://firebasestorage.googleapis.com/...';
    const mockUser = {
      id: 'test-user-id',
      fullName: 'Test User',
      email: 'test@example.com',
      avatarUrl: mockAvatarUrl,
    };

    (FirebaseStorageService.generateAvatarPath as jest.Mock).mockReturnValue(mockAvatarPath);
    (FirebaseStorageService.uploadFile as jest.Mock).mockResolvedValue(mockAvatarUrl);

    // Mock UsersService update method
    const { UsersService } = require('../service.js');
    const mockUpdate = jest.fn().mockResolvedValue(mockUser);
    UsersService.mockImplementation(() => ({
      update: mockUpdate,
    }));

    await uploadMyAvatar(mockReq as Request, mockRes as Response);

    expect(FirebaseStorageService.generateAvatarPath).toHaveBeenCalledWith(
      'test-user-id',
      'test-avatar.jpg'
    );
    expect(FirebaseStorageService.uploadFile).toHaveBeenCalledWith(
      mockReq.file,
      mockAvatarPath,
      expect.objectContaining({
        userId: 'test-user-id',
        type: 'avatar',
      })
    );
    expect(mockUpdate).toHaveBeenCalledWith('test-user-id', { avatarUrl: mockAvatarUrl });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      data: {
        avatarUrl: mockAvatarUrl,
        user: {
          id: mockUser.id,
          fullName: mockUser.fullName,
          email: mockUser.email,
          avatarUrl: mockUser.avatarUrl,
        },
      },
      message: 'Tải lên avatar thành công',
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await uploadMyAvatar(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Không xác định được người dùng',
    });
  });

  it('should return 400 if no file is uploaded', async () => {
    mockReq.file = undefined;

    await uploadMyAvatar(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Không có file được tải lên',
    });
  });

  it('should return 400 if file type is not supported', async () => {
    mockReq.file!.mimetype = 'application/pdf';

    await uploadMyAvatar(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Loại file không được hỗ trợ. Chỉ chấp nhận PNG, JPEG, JPG, WEBP',
    });
  });

  it('should return 400 if file size exceeds limit', async () => {
    mockReq.file!.size = 6 * 1024 * 1024; // 6MB

    await uploadMyAvatar(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'File quá lớn. Kích thước tối đa là 5MB',
    });
  });
});
