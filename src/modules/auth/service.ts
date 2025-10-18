import { prisma } from '../../loaders/prisma.js';
import { AuthUtils } from '../../utils/auth.js';
import { ValidationUtils } from '../../utils/validate.js';
import {
  createValidationError,
  createAuthError,
  createNotFoundError,
  createConflictError,
  AuthenticationError,
} from '../../utils/error.js';
import { LoginDto, RegisterDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto.js';

export class AuthService {
  // ========================================
  // LOGIN
  // ========================================
  async login(data: LoginDto) {
    // NOTE: Email validation already handled by Zod in DTO
    const email = ValidationUtils.normalizeEmail(data.email);

    // Find user
    const user = await prisma.user.findUnique({
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

    if (!user) {
      throw createAuthError('Email hoặc mật khẩu không đúng', 'AUTH_INVALID_CREDENTIALS');
    }

    // Check account status
    if (user.isLocked) {
      throw createAuthError('Tài khoản đã bị khóa', 'AUTH_ACCOUNT_LOCKED');
    }

    if (!user.isActive) {
      throw createAuthError('Tài khoản chưa được kích hoạt', 'AUTH_ACCOUNT_INACTIVE');
    }

    // Verify password
    const isPasswordValid = await AuthUtils.verifyPassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw createAuthError('Email hoặc mật khẩu không đúng', 'AUTH_INVALID_CREDENTIALS');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate tokens
    const accessToken = AuthUtils.generateAccessToken(user.id, user.role, user.companyId || undefined);
    const refreshToken = AuthUtils.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        companyId: user.companyId,
        companyRole: user.companyRole,
        isEmailVerified: user.isEmailVerified,
        avatarUrl: user.avatarUrl
      }
    };
  }

  // ========================================
  // REGISTER
  // ========================================
  async register(data: RegisterDto) {
    // NOTE: Email validation already handled by Zod in DTO
    const email = ValidationUtils.normalizeEmail(data.email);

    // Password validation removed - no strength requirements

    // Validate phone number if provided
    if (data.phoneNumber && data.phoneNumber.trim()) {
      if (!ValidationUtils.isValidVietnamesePhone(data.phoneNumber)) {
        throw createValidationError('Số điện thoại không hợp lệ');
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      throw createConflictError('Email đã được sử dụng');
    }

    // Hash password
    const passwordHash = await AuthUtils.hashPassword(data.password);

    // Create user (always CANDIDATE role for public registration)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: ValidationUtils.sanitizeString(data.fullName),
        phoneNumber: data.phoneNumber ? ValidationUtils.sanitizeString(data.phoneNumber) : null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender as any,
        nationality: data.nationality ? ValidationUtils.sanitizeString(data.nationality) : null,
        role: 'CANDIDATE' // Security: always CANDIDATE for public registration
      },
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

    // Generate email verification token
    const verificationToken = AuthUtils.generateEmailVerificationToken(user.id);

    // TODO: Send email verification
    console.log(`Email verification token for ${user.email}: ${verificationToken}`);

    // Generate access & refresh tokens
    const accessToken = AuthUtils.generateAccessToken(user.id, user.role);
    const refreshToken = AuthUtils.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        companyId: user.companyId,
        companyRole: user.companyRole,
        isEmailVerified: user.isEmailVerified
      },
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.'
    };
  }

  // ========================================
  // REFRESH TOKEN
  // ========================================
  async refreshToken(data: RefreshTokenDto) {
    // Verify refresh token
    const tokenResult = AuthUtils.verifyRefreshToken(data.refreshToken);
    if (!tokenResult.valid || !tokenResult.payload) {
      throw createAuthError('Refresh token không hợp lệ', 'AUTH_REFRESH_TOKEN_INVALID');
    }

    const { sub: userId } = tokenResult.payload;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        companyId: true,
        isActive: true,
        isLocked: true
      }
    });

    if (!user) {
      throw createNotFoundError('Người dùng');
    }

    // Check account status
    if (!user.isActive) {
      throw createAuthError('Tài khoản chưa được kích hoạt', 'AUTH_ACCOUNT_INACTIVE');
    }

    if (user.isLocked) {
      throw createAuthError('Tài khoản đã bị khóa', 'AUTH_ACCOUNT_LOCKED');
    }

    // Generate new tokens
    const newAccessToken = AuthUtils.generateAccessToken(user.id, user.role, user.companyId || undefined);
    const newRefreshToken = AuthUtils.generateRefreshToken(user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  // ========================================
  // VERIFY EMAIL
  // ========================================
  async verifyEmail(data: VerifyEmailDto) {
    // Verify email verification token
    const tokenResult = AuthUtils.verifyToken(data.token);
    if (!tokenResult.valid || !tokenResult.payload) {
      throw createAuthError('Token xác thực không hợp lệ', 'AUTH_EMAIL_VERIFICATION_FAILED');
    }

    const { sub: userId, type } = tokenResult.payload;
    if (type !== 'email_verification') {
      throw createAuthError('Token xác thực không hợp lệ', 'AUTH_EMAIL_VERIFICATION_FAILED');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isEmailVerified: true }
    });

    if (!user) {
      throw createNotFoundError('Người dùng');
    }

    if (user.isEmailVerified) {
      throw createConflictError('Email đã được xác thực');
    }

    // Update email verification status
    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true }
    });

    return { message: 'Email verified successfully' };
  }

  // ========================================
  // FORGOT PASSWORD
  // ========================================
  async forgotPassword(data: ForgotPasswordDto) {
    // NOTE: Email validation already handled by Zod in DTO
    const email = ValidationUtils.normalizeEmail(data.email);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    });

    if (user) {
      // Generate password reset token
      const resetToken = AuthUtils.generatePasswordResetToken(user.id);

      // TODO: Send password reset email
      console.log(`Password reset token for ${user.email}: ${resetToken}`);
    }

    // Always return success to prevent email enumeration
    return { message: 'If the email exists, you will receive password reset instructions' };
  }

  // ========================================
  // RESET PASSWORD
  // ========================================
  async resetPassword(data: ResetPasswordDto) {
    // Password validation removed - no strength requirements

    // Verify password reset token
    const tokenResult = AuthUtils.verifyToken(data.token);
    if (!tokenResult.valid || !tokenResult.payload) {
      throw createAuthError('Token đặt lại mật khẩu không hợp lệ', 'AUTH_PASSWORD_RESET_TOKEN_INVALID');
    }

    const { sub: userId, type } = tokenResult.payload;
    if (type !== 'password_reset') {
      throw createAuthError('Token đặt lại mật khẩu không hợp lệ', 'AUTH_PASSWORD_RESET_TOKEN_INVALID');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true, isLocked: true }
    });

    if (!user) {
      throw createNotFoundError('Người dùng');
    }

    if (!user.isActive) {
      throw createAuthError('Tài khoản chưa được kích hoạt', 'AUTH_ACCOUNT_INACTIVE');
    }

    if (user.isLocked) {
      throw createAuthError('Tài khoản đã bị khóa', 'AUTH_ACCOUNT_LOCKED');
    }

    // Hash new password
    const passwordHash = await AuthUtils.hashPassword(data.password);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return { message: 'Password reset successfully' };
  }

  // ========================================
  // RESEND VERIFICATION
  // ========================================
  async resendVerification(email: string) {
    // Validate email
    if (!ValidationUtils.isValidEmail(email)) {
      throw createValidationError('Email không hợp lệ');
    }

    const normalizedEmail = ValidationUtils.normalizeEmail(email);

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, isEmailVerified: true }
    });

    if (!user) {
      // Don't reveal if user exists (prevent email enumeration)
      return { message: 'If the email exists and is not verified, you will receive a verification link' };
    }

    if (user.isEmailVerified) {
      throw createConflictError('Email đã được xác thực');
    }

    // Generate new verification token
    const verificationToken = AuthUtils.generateEmailVerificationToken(user.id);

    // TODO: Send email verification
    console.log(`Email verification token for ${user.email}: ${verificationToken}`);

    return { message: 'Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.' };
  }

  // ========================================
  // LOGOUT
  // ========================================
  async logout() {
    // TODO: Implement token blacklisting if needed
    return { message: 'Logged out successfully' };
  }
}
