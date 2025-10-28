import type { Request, Response } from 'express';
import { AuthService } from './service.js';
import { LoginDto, RegisterDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto, ResendVerificationDto } from './dto.js';
import { ResponseUtils } from '../../utils/response.js';
import { AppError } from '../../utils/error.js';

/**
 * Auth Controller
 * Handles HTTP requests for authentication operations
 * Uses AuthService for business logic
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // ========================================
  // ERROR HANDLING
  // ========================================
  private handleError(error: unknown, res: Response) {
    if (error instanceof AppError) {
      return ResponseUtils.error(res, error.message, error.statusCode, undefined, error.code);
    }

    if (error instanceof Error && error.name === 'ZodError') {
      return ResponseUtils.badRequest(res, 'Dữ liệu không hợp lệ');
    }

    return ResponseUtils.internalError(res, 'Có lỗi xảy ra');
  }
  // ========================================
  // LOGIN
  // ========================================
  async login(req: Request, res: Response) {
    try {
      const data = LoginDto.parse(req.body);
      const result = await this.authService.login(data);
      return ResponseUtils.success(res, result, 'Đăng nhập thành công');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // REGISTER
  // ========================================
  async register(req: Request, res: Response) {
    try {
      const data = RegisterDto.parse(req.body);
      const result = await this.authService.register(data);
      return ResponseUtils.created(res, result, 'Đăng ký thành công');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // REFRESH TOKEN
  // ========================================
  async refreshToken(req: Request, res: Response) {
    try {
      const data = RefreshTokenDto.parse(req.body);
      const result = await this.authService.refreshToken(data);
      return ResponseUtils.success(res, result, 'Token đã được làm mới');
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // VERIFY EMAIL
  // ========================================
  async verifyEmail(req: Request, res: Response) {
    try {
      const data = VerifyEmailDto.parse(req.body);
      const result = await this.authService.verifyEmail(data);
      return ResponseUtils.success(res, null, result.message);
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // FORGOT PASSWORD
  // ========================================
  async forgotPassword(req: Request, res: Response) {
    try {
      const data = ForgotPasswordDto.parse(req.body);
      const result = await this.authService.forgotPassword(data);
      return ResponseUtils.success(res, null, result.message);
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // RESET PASSWORD
  // ========================================
  async resetPassword(req: Request, res: Response) {
    try {
      const data = ResetPasswordDto.parse(req.body);
      const result = await this.authService.resetPassword(data);
      return ResponseUtils.success(res, null, result.message);
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // RESEND VERIFICATION
  // ========================================
  async resendVerification(req: Request, res: Response) {
    try {
      const data = ResendVerificationDto.parse(req.body);
      const result = await this.authService.resendVerification(data.email);
      return ResponseUtils.success(res, null, result.message);
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  // ========================================
  // LOGOUT
  // ========================================
  async logout(req: Request, res: Response) {
    try {
      const result = await this.authService.logout();
      return ResponseUtils.success(res, null, result.message);
    } catch (error) {
      return this.handleError(error, res);
    }
  }
}
