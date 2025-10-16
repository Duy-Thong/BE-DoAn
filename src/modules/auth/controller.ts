import { Request, Response } from 'express';
import { AuthService } from './service.js';
import { LoginDto, RegisterDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto.js';

const authService = new AuthService();

export class AuthController {
  // Login
  async login(req: Request, res: Response) {
    try {
      const data = LoginDto.parse(req.body);
      const result = await authService.login(data);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Đăng nhập thất bại'
      });
    }
  }

  // Register
  async register(req: Request, res: Response) {
    try {
      const data = RegisterDto.parse(req.body);
      const result = await authService.register(data);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Đăng ký thành công'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Đăng ký thất bại'
      });
    }
  }

  // Refresh Token
  async refreshToken(req: Request, res: Response) {
    try {
      const data = RefreshTokenDto.parse(req.body);
      const result = await authService.refreshToken(data);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Refresh token thất bại'
      });
    }
  }

  // Email Verification
  async verifyEmail(req: Request, res: Response) {
    try {
      const data = VerifyEmailDto.parse(req.body);
      const result = await authService.verifyEmail(data);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Xác thực email thất bại'
      });
    }
  }

  // Forgot Password
  async forgotPassword(req: Request, res: Response) {
    try {
      const data = ForgotPasswordDto.parse(req.body);
      const result = await authService.forgotPassword(data);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Gửi email đặt lại mật khẩu thất bại'
      });
    }
  }

  // Reset Password
  async resetPassword(req: Request, res: Response) {
    try {
      const data = ResetPasswordDto.parse(req.body);
      const result = await authService.resetPassword(data);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Đặt lại mật khẩu thất bại'
      });
    }
  }

  // Logout
  async logout(req: Request, res: Response) {
    try {
      const result = await authService.logout();

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Đăng xuất thất bại'
      });
    }
  }
}
