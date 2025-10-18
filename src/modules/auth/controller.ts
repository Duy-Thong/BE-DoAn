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
        const errorResponse = ErrorCodeUtils.createErrorResponse(error.code as ErrorCode);
        return ResponseUtils.error(res, errorResponse.error, error.statusCode);
      }
      
      // Handle validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        const errorResponse = ErrorCodeUtils.createErrorResponse('VAL_INVALID_FORMAT' as any);
        return ResponseUtils.error(res, errorResponse.error, 400);
      }

      const errorResponse = ErrorCodeUtils.createErrorResponse('SYS_INTERNAL_ERROR' as any);
      return ResponseUtils.internalError(res, errorResponse.error);
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
        const errorResponse = ErrorCodeUtils.createErrorResponse(error.code! as ErrorCode);
        return ResponseUtils.error(res, errorResponse.error, error.statusCode);
      }
      
      // Handle validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        const errorResponse = ErrorCodeUtils.createErrorResponse('VAL_INVALID_FORMAT' as any);
        return ResponseUtils.error(res, errorResponse.error, 400);
      }

      // Log the actual error for debugging
      console.error('Unexpected error in registration:', error);
      const errorResponse = ErrorCodeUtils.createErrorResponse('SYS_INTERNAL_ERROR' as any);
      return ResponseUtils.internalError(res, errorResponse.error);
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
        const errorResponse = ErrorCodeUtils.createErrorResponse(error.code! as ErrorCode);
        return ResponseUtils.error(res, errorResponse.error, error.statusCode);
      }
      
      // Handle validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        const errorResponse = ErrorCodeUtils.createErrorResponse('VAL_INVALID_FORMAT' as any);
        return ResponseUtils.error(res, errorResponse.error, 400);
      }

      const errorResponse = ErrorCodeUtils.createErrorResponse('SYS_INTERNAL_ERROR' as any);
      return ResponseUtils.internalError(res, errorResponse.error);
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
        const errorResponse = ErrorCodeUtils.createErrorResponse(error.code! as ErrorCode);
        return ResponseUtils.error(res, errorResponse.error, error.statusCode);
      }
      
      // Handle validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        const errorResponse = ErrorCodeUtils.createErrorResponse('VAL_INVALID_FORMAT' as any);
        return ResponseUtils.error(res, errorResponse.error, 400);
      }

      const errorResponse = ErrorCodeUtils.createErrorResponse('SYS_INTERNAL_ERROR' as any);
      return ResponseUtils.internalError(res, errorResponse.error);
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
        const errorResponse = ErrorCodeUtils.createErrorResponse(error.code! as ErrorCode);
        return ResponseUtils.error(res, errorResponse.error, error.statusCode);
      }
      
      // Handle validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        const errorResponse = ErrorCodeUtils.createErrorResponse('VAL_INVALID_FORMAT' as any);
        return ResponseUtils.error(res, errorResponse.error, 400);
      }

      const errorResponse = ErrorCodeUtils.createErrorResponse('SYS_INTERNAL_ERROR' as any);
      return ResponseUtils.internalError(res, errorResponse.error);
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
        const errorResponse = ErrorCodeUtils.createErrorResponse(error.code! as ErrorCode);
        return ResponseUtils.error(res, errorResponse.error, error.statusCode);
      }
      
      // Handle validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        const errorResponse = ErrorCodeUtils.createErrorResponse('VAL_INVALID_FORMAT' as any);
        return ResponseUtils.error(res, errorResponse.error, 400);
      }

      const errorResponse = ErrorCodeUtils.createErrorResponse('SYS_INTERNAL_ERROR' as any);
      return ResponseUtils.internalError(res, errorResponse.error);
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
        const errorResponse = ErrorCodeUtils.createErrorResponse(error.code! as ErrorCode);
        return ResponseUtils.error(res, errorResponse.error, error.statusCode);
      }

      // Handle validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        const errorResponse = ErrorCodeUtils.createErrorResponse('VAL_INVALID_FORMAT' as any);
        return ResponseUtils.error(res, errorResponse.error, 400);
      }

      const errorResponse = ErrorCodeUtils.createErrorResponse('SYS_INTERNAL_ERROR' as any);
      return ResponseUtils.internalError(res, errorResponse.error);
    }
  }

  // Logout
  async logout(req: Request, res: Response) {
    try {
      const result = await authService.logout();

      ResponseUtils.success(res, null, result.message);
    } catch (error) {
      if (error instanceof AppError) {
        const errorResponse = ErrorCodeUtils.createErrorResponse(error.code! as ErrorCode);
        return ResponseUtils.error(res, errorResponse.error, error.statusCode);
      }

      const errorResponse = ErrorCodeUtils.createErrorResponse('SYS_INTERNAL_ERROR' as any);
      return ResponseUtils.internalError(res, errorResponse.error);
    }
  }
}
