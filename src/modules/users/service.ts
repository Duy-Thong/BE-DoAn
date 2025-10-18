import bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/index.js';
import { prisma } from '../../loaders/prisma.js';
import { AppError } from '../../utils/error.js';
import { ValidationUtils } from '../../utils/validate.js';
import type { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto.js';

export class UsersService {
  // List users with pagination and filtering
  async list(query: UserQueryDto) {
    const { page, limit, search, role, isActive, isLocked, isEmailVerified, companyId, sortBy, sortOrder } = query;

    const where: Prisma.UserWhereInput = {};

    // Apply filters
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role !== undefined) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    if (isLocked !== undefined) where.isLocked = isLocked;
    if (isEmailVerified !== undefined) where.isEmailVerified = isEmailVerified;
    if (companyId !== undefined) where.companyId = companyId;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          dateOfBirth: true,
          gender: true,
          nationality: true,
          role: true,
          isActive: true,
          isLocked: true,
          isEmailVerified: true,
          lastLoginAt: true,
          avatarUrl: true,
          companyId: true,
          companyRole: true,
          joinedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Create a new user
  async create(input: CreateUserDto) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError('Email đã tồn tại', 400);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        fullName: input.fullName,
        passwordHash,
        phoneNumber: input.phoneNumber,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        gender: input.gender,
        nationality: input.nationality,
        role: input.role,
        avatarUrl: input.avatarUrl,
        companyId: input.companyId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        dateOfBirth: true,
        gender: true,
        nationality: true,
        role: true,
        isActive: true,
        isLocked: true,
        isEmailVerified: true,
        lastLoginAt: true,
        avatarUrl: true,
        companyId: true,
        companyRole: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  // Get user by ID
  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        dateOfBirth: true,
        gender: true,
        nationality: true,
        role: true,
        isActive: true,
        isLocked: true,
        isEmailVerified: true,
        lastLoginAt: true,
        avatarUrl: true,
        companyId: true,
        companyRole: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Người dùng không tồn tại', 404);
    }

    return user;
  }

  // Update user
  async update(id: string, input: UpdateUserDto) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new AppError('Người dùng không tồn tại', 404);
    }

    // Check email uniqueness if email is being updated
    if (input.email && input.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (emailExists) {
        throw new AppError('Email đã tồn tại', 400);
      }
    }

    const data: Prisma.UserUpdateInput = {};

    if (input.email !== undefined) data.email = input.email;
    if (input.fullName !== undefined) data.fullName = input.fullName;
    if (input.phoneNumber !== undefined) data.phoneNumber = input.phoneNumber;
    if (input.dateOfBirth !== undefined) {
      data.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null;
    }
    if (input.gender !== undefined) data.gender = input.gender;
    if (input.nationality !== undefined) data.nationality = input.nationality;
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
    if (input.password) {
      data.passwordHash = await bcrypt.hash(input.password, 10);
    }
    if (input.role !== undefined) data.role = input.role;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.isLocked !== undefined) data.isLocked = input.isLocked;
    if (input.isEmailVerified !== undefined) data.isEmailVerified = input.isEmailVerified;
    if (input.companyId !== undefined) data.companyId = input.companyId;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        dateOfBirth: true,
        gender: true,
        nationality: true,
        role: true,
        isActive: true,
        isLocked: true,
        isEmailVerified: true,
        lastLoginAt: true,
        avatarUrl: true,
        companyId: true,
        companyRole: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  // Delete user
  async remove(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('Người dùng không tồn tại', 404);
    }

    await prisma.user.delete({
      where: { id },
    });

    return { message: 'Xóa người dùng thành công' };
  }

  // Additional methods
  async updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async lockUser(id: string) {
    return this.update(id, { isLocked: true });
  }

  async unlockUser(id: string) {
    return this.update(id, { isLocked: false });
  }

  async verifyEmail(id: string) {
    return this.update(id, { isEmailVerified: true });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('Người dùng không tồn tại', 404);
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Mật khẩu hiện tại không đúng', 400);
    }

    // Validate new password strength
    const passwordValidation = ValidationUtils.isValidPassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new AppError(passwordValidation.errors.join(', '), 400);
    }

    // Hash and update new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }
}
