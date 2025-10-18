import { Prisma } from '../../generated/prisma/index.js';
import { prisma } from '../../loaders/prisma.js';
import { AuthUtils } from '../../utils/auth.js';
import { ValidationUtils } from '../../utils/validate.js';
import {
  createValidationError,
  createNotFoundError,
  createConflictError,
} from '../../utils/error.js';
import type { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto.js';

/**
 * Common select fields for user queries
 * Avoids duplication across service methods
 */
const USER_SELECT_FIELDS = {
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
} as const;

export class UsersService {
  // ========================================
  // LIST USERS
  // ========================================
  async list(query: UserQueryDto) {
    const { page, limit, search, role, isActive, isLocked, isEmailVerified, companyId, sortBy, sortOrder } = query;

    const where: Prisma.UserWhereInput = {};

    // Apply search filter (only if not empty string)
    if (search && search.trim() !== '') {
      const sanitizedSearch = ValidationUtils.validateSearchQuery(search);
      where.OR = [
        { email: { contains: sanitizedSearch, mode: 'insensitive' } },
        { fullName: { contains: sanitizedSearch, mode: 'insensitive' } },
        { phoneNumber: { contains: sanitizedSearch, mode: 'insensitive' } },
      ];
    }

    // Apply other filters (DTO đã xử lý empty strings thành undefined)
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
        select: USER_SELECT_FIELDS,
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

  // ========================================
  // CREATE USER
  // ========================================
  async create(input: CreateUserDto) {
    // Email already normalized by Zod transform
    const email = input.email;

    // Validate password strength
    const passwordValidation = ValidationUtils.isValidPassword(input.password);
    if (!passwordValidation.isValid) {
      throw createValidationError(passwordValidation.errors);
    }

    // Validate phone number if provided
    if (input.phoneNumber && input.phoneNumber.trim()) {
      if (!ValidationUtils.isValidVietnamesePhone(input.phoneNumber)) {
        throw createValidationError('Số điện thoại không hợp lệ');
      }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createConflictError('Email đã tồn tại');
    }

    // Hash password using AuthUtils (12 rounds)
    const passwordHash = await AuthUtils.hashPassword(input.password);

    // Create user with sanitized inputs
    const user = await prisma.user.create({
      data: {
        email,
        fullName: ValidationUtils.sanitizeString(input.fullName),
        passwordHash,
        phoneNumber: input.phoneNumber ? ValidationUtils.sanitizeString(input.phoneNumber) : null,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        gender: input.gender,
        nationality: input.nationality ? ValidationUtils.sanitizeString(input.nationality) : null,
        role: input.role,
        avatarUrl: input.avatarUrl,
        companyId: input.companyId,
      },
      select: USER_SELECT_FIELDS,
    });

    return user;
  }

  // ========================================
  // GET USER BY ID
  // ========================================
  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...USER_SELECT_FIELDS,
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
      throw createNotFoundError('Người dùng');
    }

    return user;
  }

  // ========================================
  // UPDATE USER
  // ========================================
  async update(id: string, input: UpdateUserDto) {
    // Use transaction to prevent race conditions
    return await prisma.$transaction(async (tx) => {
      // Check if user exists
      const existingUser = await tx.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw createNotFoundError('Người dùng');
      }

      // Check email uniqueness if email is being updated
      if (input.email && input.email !== existingUser.email) {
        const emailExists = await tx.user.findUnique({
          where: { email: input.email },
        });

        if (emailExists) {
          throw createConflictError('Email đã tồn tại');
        }
      }

      // Validate password if being updated
      if (input.password) {
        const passwordValidation = ValidationUtils.isValidPassword(input.password);
        if (!passwordValidation.isValid) {
          throw createValidationError(passwordValidation.errors);
        }
      }

      // Validate phone number if being updated
      if (input.phoneNumber && input.phoneNumber.trim()) {
        if (!ValidationUtils.isValidVietnamesePhone(input.phoneNumber)) {
          throw createValidationError('Số điện thoại không hợp lệ');
        }
      }

      // Build update data with sanitization
      const data: Prisma.UserUpdateInput = {};

      if (input.email !== undefined) data.email = input.email; // Already normalized by Zod
      if (input.fullName !== undefined) data.fullName = ValidationUtils.sanitizeString(input.fullName);
      if (input.phoneNumber !== undefined) {
        data.phoneNumber = input.phoneNumber ? ValidationUtils.sanitizeString(input.phoneNumber) : null;
      }
      if (input.dateOfBirth !== undefined) {
        data.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null;
      }
      if (input.gender !== undefined) data.gender = input.gender;
      if (input.nationality !== undefined) {
        data.nationality = input.nationality ? ValidationUtils.sanitizeString(input.nationality) : null;
      }
      if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
      if (input.password) {
        data.passwordHash = await AuthUtils.hashPassword(input.password);
      }
      if (input.role !== undefined) data.role = input.role;
      if (input.isActive !== undefined) data.isActive = input.isActive;
      if (input.isLocked !== undefined) data.isLocked = input.isLocked;
      if (input.isEmailVerified !== undefined) data.isEmailVerified = input.isEmailVerified;
      if (input.companyId !== undefined) data.companyId = input.companyId;

      // Update user
      const user = await tx.user.update({
        where: { id },
        data,
        select: USER_SELECT_FIELDS,
      });

      return user;
    });
  }

  // ========================================
  // DELETE USER
  // ========================================
  async remove(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw createNotFoundError('Người dùng');
    }

    await prisma.user.delete({
      where: { id },
    });

    return { message: 'Xóa người dùng thành công' };
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  async updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async findByEmail(email: string) {
    const normalizedEmail = ValidationUtils.normalizeEmail(email);
    return prisma.user.findUnique({
      where: { email: normalizedEmail },
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

  // ========================================
  // CHANGE PASSWORD
  // ========================================
  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw createNotFoundError('Người dùng');
    }

    // Verify current password
    const isValidPassword = await AuthUtils.verifyPassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw createValidationError('Mật khẩu hiện tại không đúng');
    }

    // Validate new password strength
    const passwordValidation = ValidationUtils.isValidPassword(newPassword);
    if (!passwordValidation.isValid) {
      throw createValidationError(passwordValidation.errors);
    }

    // Hash and update new password
    const newPasswordHash = await AuthUtils.hashPassword(newPassword);
    await prisma.user.update({
      where: { id },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }
}
