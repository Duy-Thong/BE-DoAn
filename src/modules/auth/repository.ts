import { prisma } from '../../loaders/prisma.js';
import { createNotFoundError, createConflictError } from '../../utils/error.js';
import type { RegisterDto } from './dto.js';

/**
 * Auth Repository
 * Handles all data access operations for authentication
 * Pure data access layer - no business logic, no validation
 */
export class AuthRepository {
  // ========================================
  // USER LOOKUP OPERATIONS
  // ========================================
  
  /**
   * Find user by email for login
   */
  async findUserForLogin(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        fullName: true,
        role: true,
        companyId: true,
        companyRole: true,
        isActive: true,
        isLocked: true,
        isEmailVerified: true,
        avatarUrl: true,
        lastLoginAt: true
      }
    });
  }

  /**
   * Find user by ID for token refresh
   */
  async findUserForTokenRefresh(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        companyId: true,
        isActive: true,
        isLocked: true
      }
    });
  }

  /**
   * Find user by email for password reset
   */
  async findUserForPasswordReset(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    });
  }

  /**
   * Find user by ID for email verification
   */
  async findUserForEmailVerification(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isEmailVerified: true }
    });
  }

  /**
   * Find user by ID for password reset verification
   */
  async findUserForPasswordResetVerification(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true, isLocked: true }
    });
  }

  /**
   * Find user by email for resend verification
   */
  async findUserForResendVerification(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, isEmailVerified: true }
    });
  }

  // ========================================
  // USER CREATION OPERATIONS
  // ========================================

  /**
   * Check if email already exists
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });
    return !!user;
  }

  /**
   * Create new user (for registration)
   */
  async createUser(userData: {
    email: string;
    passwordHash: string;
    fullName: string;
    phoneNumber?: string | null;
    dateOfBirth?: Date | null;
    gender?: any;
    nationality?: string | null;
    role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
  }) {
    return prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        companyId: true,
        companyRole: true,
        isEmailVerified: true
      }
    });
  }

  // ========================================
  // USER UPDATE OPERATIONS
  // ========================================

  /**
   * Update last login time
   */
  async updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });
  }

  /**
   * Update email verification status
   */
  async updateEmailVerification(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true }
    });
  }

  /**
   * Update password
   */
  async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
  }
}
