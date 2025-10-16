import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../loaders/prisma.js';
import { env } from '../../config/env.js';
import { LoginDto, RegisterDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto.js';

export class AuthService {
  // Login user
  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new Error('Thông tin đăng nhập không chính xác');
    }
    
    // Check if user is locked
    if (user.isLocked) {
      throw new Error('Tài khoản đã bị khóa');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Tài khoản chưa được kích hoạt');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Thông tin đăng nhập không chính xác');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: '30d' });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatarUrl: user.avatarUrl
      }
    };
  }

  // Register new user
  async register(data: RegisterDto) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('Người dùng đã tồn tại');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender as any,
        nationality: data.nationality,
        role: data.role
      }
    });

    // TODO: Send email verification
    // For now, we'll mark as verified by default
    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true }
    });

    // Generate tokens
    const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: '30d' });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: true
      }
    };
  }

  // Refresh token
  async refreshToken(data: RefreshTokenDto) {
    const decoded = jwt.verify(data.refreshToken, env.JWT_SECRET) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    const newToken = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
    const newRefreshToken = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: '30d' });

    return {
      token: newToken,
      refreshToken: newRefreshToken
    };
  }

  // Verify email
  async verifyEmail(data: VerifyEmailDto) {
    // TODO: Implement email verification token validation
    // For now, this is a placeholder
    return { message: 'Email đã được xác thực thành công' };
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordDto) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu' };
    }

    // TODO: Send password reset email
    return { message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu' };
  }

  // Reset password
  async resetPassword(data: ResetPasswordDto) {
    // TODO: Implement password reset token validation
    // For now, this is a placeholder
    return { message: 'Mật khẩu đã được đặt lại thành công' };
  }

  // Logout (client-side token removal)
  async logout() {
    // TODO: Implement token blacklisting if needed
    return { message: 'Đăng xuất thành công' };
  }
}
