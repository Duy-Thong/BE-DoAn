import { Prisma } from '../../generated/prisma/index.js';
import { prisma } from '../../loaders/prisma.js';
import { ValidationUtils } from '../../utils/validate.js';
import { AuthUtils } from '../../utils/auth.js';
import { createNotFoundError, createConflictError } from '../../utils/error.js';
import type { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto.js';

/**
 * Common select fields for user queries
 * Avoids duplication across repository methods
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

/**
 * User Repository
 * Pure data access layer - NO business logic, NO validation
 * Only handles database operations
 */
export class UserRepository {
  // ========================================
  // QUERY OPERATIONS
  // ========================================

  /**
   * Find users with pagination and filters
   */
  async findMany(query: UserQueryDto) {
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

    // Apply other filters
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

  /**
   * Find user by ID
   */
  async findById(id: string) {
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

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    const normalizedEmail = ValidationUtils.normalizeEmail(email);
    return prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  /**
   * Get user with password hash for authentication
   */
  async findByIdWithPassword(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        passwordHash: true,
      },
    });
  }

  // ========================================
  // CREATE OPERATIONS
  // ========================================

  /**
   * Create new user (assumes input is already validated)
   */
  async create(input: CreateUserDto) {
    // Email already normalized by Zod transform
    const email = input.email;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createConflictError('Email đã tồn tại');
    }

    // Hash password using AuthUtils
    const passwordHash = await AuthUtils.hashPassword(input.password);

    // Create user with sanitized inputs
    const user = await prisma.user.create({
      data: {
        email,
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
      select: USER_SELECT_FIELDS,
    });

    return user;
  }

  // ========================================
  // UPDATE OPERATIONS
  // ========================================

  /**
   * Update user by ID (assumes input is already validated)
   */
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

      // Build update data
      const data: Prisma.UserUpdateInput = {};

      if (input.email !== undefined) data.email = input.email; // Already normalized by Zod
      if (input.fullName !== undefined) data.fullName = input.fullName;
      if (input.phoneNumber !== undefined) {
        data.phoneNumber = input.phoneNumber;
      }
      if (input.dateOfBirth !== undefined) {
        data.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null;
      }
      if (input.gender !== undefined) data.gender = input.gender;
      if (input.nationality !== undefined) {
        data.nationality = input.nationality;
      }
      if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
      if (input.password) {
        data.passwordHash = await AuthUtils.hashPassword(input.password);
      }
      if (input.role !== undefined) data.role = input.role;
      if (input.isActive !== undefined) data.isActive = input.isActive;
      if (input.isLocked !== undefined) data.isLocked = input.isLocked;
      if (input.isEmailVerified !== undefined) data.isEmailVerified = input.isEmailVerified;
      if (input.companyId !== undefined) (data as any).companyId = input.companyId;

      // Update user
      const user = await tx.user.update({
        where: { id },
        data,
        select: USER_SELECT_FIELDS,
      });

      return user;
    });
  }

  /**
   * Update user's last login time
   */
  async updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Update user's password
   */
  async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  // ========================================
  // DELETE OPERATIONS
  // ========================================

  /**
   * Delete user by ID
   */
  async delete(id: string) {
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
  // HELPER OPERATIONS
  // ========================================

  /**
   * Lock user
   */
  async lockUser(id: string) {
    return this.update(id, { isLocked: true });
  }

  /**
   * Unlock user
   */
  async unlockUser(id: string) {
    return this.update(id, { isLocked: false });
  }

  /**
   * Verify user email
   */
  async verifyEmail(id: string) {
    return this.update(id, { isEmailVerified: true });
  }
}
