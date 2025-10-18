import { prisma } from '../../loaders/prisma.js';
import { AuthUtils } from '../../utils/auth.js';
import { ValidationUtils } from '../../utils/validate.js';
import { ErrorCode, ErrorCodeUtils } from '../../utils/error-codes.js';
import { AppError } from '../../utils/error.js';
import { LoginDto, RegisterDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto.js';

export class AuthService {
  // Login user
  async login(data: LoginDto) {
    // Validate email format
    if (!AuthUtils.validateEmail(data.email)) {
      throw AuthUtils.createValidationError(ErrorCode.VAL_INVALID_EMAIL);
    }

    // Find user by email
    const user = await prisma.user.findUnique({ 
      where: { email: data.email.toLowerCase().trim() },
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
      throw AuthUtils.createAuthError(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }
    
    // Check if user is locked
    if (user.isLocked) {
      throw AuthUtils.createAuthError(ErrorCode.AUTH_ACCOUNT_LOCKED);
    }

    // Check if user is active
    if (!user.isActive) {
      throw AuthUtils.createAuthError(ErrorCode.AUTH_ACCOUNT_INACTIVE);
    }

    // Verify password
    const isPasswordValid = await AuthUtils.verifyPassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw AuthUtils.createAuthError(ErrorCode.AUTH_INVALID_CREDENTIALS);
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

  // Register new user
  async register(data: RegisterDto) {
    // Basic email validation (Zod already handles this)
    if (!data.email || !data.email.includes('@')) {
      throw AuthUtils.createValidationError(ErrorCode.VAL_INVALID_EMAIL);
    }

    // Validate password strength
    const passwordValidation = ValidationUtils.isValidPassword(data.password);
    if (!passwordValidation.isValid) {
      throw new AppError(passwordValidation.errors.join(', '), 400, true, ErrorCode.VAL_INVALID_PASSWORD);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() }
    });
    if (existingUser) {
      throw AuthUtils.createAuthError(ErrorCode.BIZ_USER_ALREADY_EXISTS);
    }

    // Hash password
    const passwordHash = await AuthUtils.hashPassword(data.password);

    // Validate phone number if provided
    if (data.phoneNumber && data.phoneNumber.trim()) {
      if (!ValidationUtils.isValidVietnamesePhone(data.phoneNumber)) {
        throw new AppError('Số điện thoại không hợp lệ', 400, true, ErrorCode.VAL_INVALID_FORMAT);
      }
    }

    // Create user with CANDIDATE role (security: users cannot choose their role during registration)
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        fullName: ValidationUtils.sanitizeString(data.fullName),
        phoneNumber: data.phoneNumber ? ValidationUtils.sanitizeString(data.phoneNumber) : null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender as any,
        nationality: data.nationality ? ValidationUtils.sanitizeString(data.nationality) : null,
        role: 'CANDIDATE' // Always CANDIDATE for public registration
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
    // For now, just log the token
    console.log(`Email verification token for ${user.email}: ${verificationToken}`);

    // Generate tokens
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

  // Refresh token
  async refreshToken(data: RefreshTokenDto) {
    // Verify refresh token
    const tokenResult = AuthUtils.verifyRefreshToken(data.refreshToken);
    if (!tokenResult.valid || !tokenResult.payload) {
      throw AuthUtils.createAuthError(ErrorCode.AUTH_REFRESH_TOKEN_INVALID);
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
      throw AuthUtils.createAuthError(ErrorCode.BIZ_USER_NOT_FOUND);
    }

    // Check if user is still active
    if (!user.isActive) {
      throw AuthUtils.createAuthError(ErrorCode.AUTH_ACCOUNT_INACTIVE);
    }

    if (user.isLocked) {
      throw AuthUtils.createAuthError(ErrorCode.AUTH_ACCOUNT_LOCKED);
    }

    // Generate new tokens
    const newAccessToken = AuthUtils.generateAccessToken(user.id, user.role, user.companyId || undefined);
    const newRefreshToken = AuthUtils.generateRefreshToken(user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  // Verify email
  async verifyEmail(data: VerifyEmailDto) {
    // Verify email verification token
    const tokenResult = AuthUtils.verifyToken(data.token);
    if (!tokenResult.valid || !tokenResult.payload) {
      throw AuthUtils.createAuthError(ErrorCode.AUTH_EMAIL_VERIFICATION_FAILED);
    }

    const { sub: userId, type } = tokenResult.payload;
    if (type !== 'email_verification') {
      throw AuthUtils.createAuthError(ErrorCode.AUTH_EMAIL_VERIFICATION_FAILED);
    }

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { id: true, isEmailVerified: true }
    });

    if (!user) {
      throw AuthUtils.createAuthError(ErrorCode.BIZ_USER_NOT_FOUND);
    }

    if (user.isEmailVerified) {
      throw AuthUtils.createAuthError(ErrorCode.BIZ_EMAIL_ALREADY_VERIFIED);
    }

    // Update email verification status
    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true }
    });

    return { message: 'Email verified successfully' };
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordDto) {
    // Validate email format
    if (!AuthUtils.validateEmail(data.email)) {
      throw AuthUtils.createValidationError(ErrorCode.VAL_INVALID_EMAIL);
    }

    const user = await prisma.user.findUnique({ 
      where: { email: data.email.toLowerCase().trim() },
      select: { id: true, email: true }
    });

    if (user) {
      // Generate password reset token
      const resetToken = AuthUtils.generatePasswordResetToken(user.id);
      
      // TODO: Send password reset email with token
      // For now, just log the token (in production, send via email)
      console.log(`Password reset token for ${user.email}: ${resetToken}`);
    }

    // Always return success message to prevent email enumeration
    return { message: 'If the email exists, you will receive password reset instructions' };
  }

  // Reset password
  async resetPassword(data: ResetPasswordDto) {
    // Validate password strength
    const passwordValidation = ValidationUtils.isValidPassword(data.password);
    if (!passwordValidation.isValid) {
      throw new AppError(passwordValidation.errors.join(', '), 400, true, ErrorCode.VAL_INVALID_PASSWORD);
    }

    // Verify password reset token
    const tokenResult = AuthUtils.verifyToken(data.token);
    if (!tokenResult.valid || !tokenResult.payload) {
      throw AuthUtils.createAuthError(ErrorCode.AUTH_PASSWORD_RESET_TOKEN_INVALID);
    }

    const { sub: userId, type } = tokenResult.payload;
    if (type !== 'password_reset') {
      throw AuthUtils.createAuthError(ErrorCode.AUTH_PASSWORD_RESET_TOKEN_INVALID);
    }

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { id: true, isActive: true, isLocked: true }
    });

    if (!user) {
      throw AuthUtils.createAuthError(ErrorCode.BIZ_USER_NOT_FOUND);
    }

    if (!user.isActive) {
      throw AuthUtils.createAuthError(ErrorCode.AUTH_ACCOUNT_INACTIVE);
    }

    if (user.isLocked) {
      throw AuthUtils.createAuthError(ErrorCode.AUTH_ACCOUNT_LOCKED);
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

  // Resend email verification
  async resendVerification(email: string) {
    // Validate email format
    if (!ValidationUtils.isValidEmail(email)) {
      throw AuthUtils.createValidationError(ErrorCode.VAL_INVALID_EMAIL);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, isEmailVerified: true }
    });

    if (!user) {
      // Don't reveal if user exists or not (prevent email enumeration)
      return { message: 'If the email exists and is not verified, you will receive a verification link' };
    }

    if (user.isEmailVerified) {
      throw new AppError('Email đã được xác thực', 400, true, ErrorCode.BIZ_EMAIL_ALREADY_VERIFIED);
    }

    // Generate new verification token
    const verificationToken = AuthUtils.generateEmailVerificationToken(user.id);

    // TODO: Send email verification
    // For now, just log the token
    console.log(`Email verification token for ${user.email}: ${verificationToken}`);

    return { message: 'Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.' };
  }

  // Logout (client-side token removal)
  async logout() {
    // TODO: Implement token blacklisting if needed
    // For now, client-side token removal is sufficient
    return { message: 'Logged out successfully' };
  }
}
