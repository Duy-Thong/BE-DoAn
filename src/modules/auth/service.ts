import { AuthRepository } from './repository.js';
import { AuthUtils } from '../../utils/auth.js';
import { ValidationUtils } from '../../utils/validate.js';
import { APP_CONSTANTS } from '../../utils/constants.js';
import {
  createValidationError,
  createAuthError,
  createNotFoundError,
  createConflictError,
} from '../../utils/error.js';
import { LoginDto, RegisterDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto.js';

/**
 * Auth Service
 * Handles business logic for authentication operations
 * Uses AuthRepository for data access
 */
export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }
  // ========================================
  // LOGIN
  // ========================================
  async login(data: LoginDto) {
    // Input validation
    if (!data.email || !data.email.trim()) {
      throw createValidationError('Email không được để trống');
    }
    if (!ValidationUtils.isValidEmail(data.email)) {
      throw createValidationError('Email không hợp lệ');
    }
    if (!data.password || !data.password.trim()) {
      throw createValidationError('Mật khẩu không được để trống');
    }

    // Email already normalized by DTO transform
    const email = data.email;

    // Find user
    const user = await this.authRepository.findUserForLogin(email);

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
    await this.authRepository.updateLastLogin(user.id);

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
    // Input validation
    if (!data.email || !data.email.trim()) {
      throw createValidationError('Email không được để trống');
    }
    if (!ValidationUtils.isValidEmail(data.email)) {
      throw createValidationError('Email không hợp lệ');
    }
    if (!data.password || !data.password.trim()) {
      throw createValidationError('Mật khẩu không được để trống');
    }
    if (data.password.length < APP_CONSTANTS.PASSWORD_MIN_LENGTH) {
      throw createValidationError(`Mật khẩu phải có ít nhất ${APP_CONSTANTS.PASSWORD_MIN_LENGTH} ký tự`);
    }
    if (data.password.length > APP_CONSTANTS.PASSWORD_MAX_LENGTH) {
      throw createValidationError(`Mật khẩu không được vượt quá ${APP_CONSTANTS.PASSWORD_MAX_LENGTH} ký tự`);
    }
    if (!data.fullName || !data.fullName.trim()) {
      throw createValidationError('Họ tên không được để trống');
    }
    if (data.fullName.length > 255) {
      throw createValidationError('Họ tên quá dài');
    }

    // Business validation - password strength
    const passwordValidation = ValidationUtils.isValidPassword(data.password);
    if (!passwordValidation.isValid) {
      throw createValidationError(passwordValidation.errors);
    }

    // Business validation - phone number if provided
    if (data.phoneNumber && data.phoneNumber.trim()) {
      if (data.phoneNumber.length > 20) {
        throw createValidationError('Số điện thoại quá dài');
      }
      if (!ValidationUtils.isValidVietnamesePhone(data.phoneNumber)) {
        throw createValidationError('Số điện thoại không hợp lệ');
      }
    }

    // Business validation - nationality if provided
    if (data.nationality && data.nationality.length > 100) {
      throw createValidationError('Quốc tịch quá dài');
    }

    // Email already normalized by DTO transform
    const email = data.email;

    // Check if user already exists
    const emailExists = await this.authRepository.emailExists(email);
    if (emailExists) {
      throw createConflictError('Email đã được sử dụng');
    }

    // Hash password
    const passwordHash = await AuthUtils.hashPassword(data.password);

    // Sanitize input data
    const sanitizedData = {
      email,
      passwordHash,
      fullName: ValidationUtils.sanitizeString(data.fullName),
      phoneNumber: data.phoneNumber ? ValidationUtils.sanitizeString(data.phoneNumber) : null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      gender: data.gender,
      nationality: data.nationality ? ValidationUtils.sanitizeString(data.nationality) : null,
      role: 'CANDIDATE' // Security: always CANDIDATE for public registration
    };

    // Create user
    const user = await this.authRepository.createUser(sanitizedData);

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
    // Input validation
    if (!data.refreshToken || !data.refreshToken.trim()) {
      throw createValidationError('Refresh token không được để trống');
    }

    // Verify refresh token
    const tokenResult = AuthUtils.verifyRefreshToken(data.refreshToken);
    if (!tokenResult.valid || !tokenResult.payload) {
      throw createAuthError('Refresh token không hợp lệ', 'AUTH_REFRESH_TOKEN_INVALID');
    }

    const { sub: userId } = tokenResult.payload;

    // Find user
    const user = await this.authRepository.findUserForTokenRefresh(userId);

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
    // Input validation
    if (!data.token || !data.token.trim()) {
      throw createValidationError('Token không được để trống');
    }
    if (data.token.length > 1000) {
      throw createValidationError('Token quá dài');
    }
    if (!/^[a-zA-Z0-9\-_]+$/.test(data.token)) {
      throw createValidationError('Token không hợp lệ');
    }

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
    const user = await this.authRepository.findUserForEmailVerification(userId);

    if (!user) {
      throw createNotFoundError('Người dùng');
    }

    if (user.isEmailVerified) {
      throw createConflictError('Email đã được xác thực');
    }

    // Update email verification status
    await this.authRepository.updateEmailVerification(userId);

    return { message: 'Email verified successfully' };
  }

  // ========================================
  // FORGOT PASSWORD
  // ========================================
  async forgotPassword(data: ForgotPasswordDto) {
    // Input validation
    if (!data.email || !data.email.trim()) {
      throw createValidationError('Email không được để trống');
    }
    if (!ValidationUtils.isValidEmail(data.email)) {
      throw createValidationError('Email không hợp lệ');
    }

    // Email already normalized by DTO transform
    const email = data.email;

    const user = await this.authRepository.findUserForPasswordReset(email);

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
    // Input validation
    if (!data.token || !data.token.trim()) {
      throw createValidationError('Token không được để trống');
    }
    if (data.token.length > 1000) {
      throw createValidationError('Token quá dài');
    }
    if (!/^[a-zA-Z0-9\-_]+$/.test(data.token)) {
      throw createValidationError('Token không hợp lệ');
    }
    if (!data.password || !data.password.trim()) {
      throw createValidationError('Mật khẩu không được để trống');
    }
    if (data.password.length < APP_CONSTANTS.PASSWORD_MIN_LENGTH) {
      throw createValidationError(`Mật khẩu phải có ít nhất ${APP_CONSTANTS.PASSWORD_MIN_LENGTH} ký tự`);
    }
    if (data.password.length > APP_CONSTANTS.PASSWORD_MAX_LENGTH) {
      throw createValidationError(`Mật khẩu không được vượt quá ${APP_CONSTANTS.PASSWORD_MAX_LENGTH} ký tự`);
    }

    // Business validation - password strength
    const passwordValidation = ValidationUtils.isValidPassword(data.password);
    if (!passwordValidation.isValid) {
      throw createValidationError(passwordValidation.errors);
    }

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
    const user = await this.authRepository.findUserForPasswordResetVerification(userId);

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
    await this.authRepository.updatePassword(userId, passwordHash);

    return { message: 'Password reset successfully' };
  }

  // ========================================
  // RESEND VERIFICATION
  // ========================================
  async resendVerification(email: string) {
    // Input validation
    if (!email || !email.trim()) {
      throw createValidationError('Email không được để trống');
    }
    if (!ValidationUtils.isValidEmail(email)) {
      throw createValidationError('Email không hợp lệ');
    }

    // Email already normalized by DTO transform
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.authRepository.findUserForResendVerification(normalizedEmail);

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
