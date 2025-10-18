import { Request, Response } from 'express';
import { AuthService } from './service.js';
import { LoginDto, RegisterDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto, ResendVerificationDto } from './dto.js';
import { ResponseUtils } from '../../utils/response.js';
import { ErrorCodeUtils, ErrorCode } from '../../utils/error-codes.js';
import { AppError } from '../../utils/error.js';

const authService = new AuthService();

export class AuthController {
  // Login
  async login(req: Request, res: Response) {
    try {
      const data = LoginDto.parse(req.body);
      const result = await authService.login(data);

      ResponseUtils.success(res, result, 'Login successful');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      // Handle validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      return ResponseUtils.internalError(res, 'Lỗi máy chủ nội bộ');
    }
  }

  // Register
  async register(req: Request, res: Response) {
    try {
      const data = RegisterDto.parse(req.body);
      const result = await authService.register(data);

      ResponseUtils.created(res, result, 'Registration successful');
    } catch (error) {
      console.error('Registration error:', error);

      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      // Handle validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      // Log the actual error for debugging
      console.error('Unexpected error in registration:', error);
      return ResponseUtils.internalError(res, 'Lỗi máy chủ nội bộ');
    }
  }

  // Refresh Token
  async refreshToken(req: Request, res: Response) {
    try {
      const data = RefreshTokenDto.parse(req.body);
      const result = await authService.refreshToken(data);

      ResponseUtils.success(res, result, 'Token refreshed successfully');
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      // Handle validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      return ResponseUtils.internalError(res, 'Lỗi máy chủ nội bộ');
    }
  }

  // Email Verification
  async verifyEmail(req: Request, res: Response) {
    try {
      const data = VerifyEmailDto.parse(req.body);
      const result = await authService.verifyEmail(data);

      ResponseUtils.success(res, null, result.message);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      // Handle validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      return ResponseUtils.internalError(res, 'Lỗi máy chủ nội bộ');
    }
  }

  // Forgot Password
  async forgotPassword(req: Request, res: Response) {
    try {
      const data = ForgotPasswordDto.parse(req.body);
      const result = await authService.forgotPassword(data);

      ResponseUtils.success(res, null, result.message);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      // Handle validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      return ResponseUtils.internalError(res, 'Lỗi máy chủ nội bộ');
    }
  }

  // Reset Password
  async resetPassword(req: Request, res: Response) {
    try {
      const data = ResetPasswordDto.parse(req.body);
      const result = await authService.resetPassword(data);

      ResponseUtils.success(res, null, result.message);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      // Handle validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      return ResponseUtils.internalError(res, 'Lỗi máy chủ nội bộ');
    }
  }

  // Resend Verification Email
  async resendVerification(req: Request, res: Response) {
    try {
      const data = ResendVerificationDto.parse(req.body);
      const result = await authService.resendVerification(data.email);

      ResponseUtils.success(res, null, result.message);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      // Handle validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        return ResponseUtils.error(res, 'Dữ liệu không hợp lệ', 400, undefined, ErrorCode.VAL_INVALID_FORMAT);
      }

      return ResponseUtils.internalError(res, 'Lỗi máy chủ nội bộ');
    }
  }

  // Logout
  async logout(req: Request, res: Response) {
    try {
      const result = await authService.logout();

      ResponseUtils.success(res, null, result.message);
    } catch (error) {
      if (error instanceof AppError) {
        return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
      }

      return ResponseUtils.internalError(res, 'Lỗi máy chủ nội bộ');
    }
  }
}
