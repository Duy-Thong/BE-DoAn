/**
 * Authentication Utilities (Refactored)
 * Focus ONLY on: JWT tokens, Password hashing, Token verification
 *
 * For validation → use ValidationUtils
 * For errors → use error.ts helpers
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { env } from '../config/env.js';

/**
 * JWT Token Types
 */
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
}

/**
 * JWT Payload Interface
 */
export interface JWTPayload {
  sub: string; // User ID
  type: TokenType;
  role?: string;
  companyId?: string;
  iat?: number;
  exp?: number;
  jti?: string; // JWT ID for token tracking
}

/**
 * Token Generation Options
 */
export interface TokenOptions {
  expiresIn?: string;
  issuer?: string;
  audience?: string;
  jti?: string;
}

/**
 * Token Verification Result
 */
export interface TokenVerificationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}

/**
 * Authentication Utilities Class
 * Focused ONLY on authentication operations
 */
export class AuthUtils {
  // ========================================
  // JWT TOKEN OPERATIONS
  // ========================================

  /**
   * Generate JWT Token (Generic)
   */
  static generateToken(
    payload: Omit<JWTPayload, 'iat' | 'exp'>,
    options: TokenOptions = {}
  ): string {
    const tokenPayload: JWTPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      jti: options.jti || crypto.randomUUID()
    };

    const tokenOptions: jwt.SignOptions = {
      expiresIn: options.expiresIn || '1h',
      issuer: options.issuer || 'recruitment-system',
      audience: options.audience || 'recruitment-app'
    };

    return jwt.sign(tokenPayload, env.JWT_SECRET, tokenOptions);
  }

  /**
   * Generate Access Token (15 minutes)
   */
  static generateAccessToken(userId: string, role: string, companyId?: string): string {
    return this.generateToken(
      {
        sub: userId,
        type: TokenType.ACCESS,
        role,
        companyId
      },
      { expiresIn: '15m' }
    );
  }

  /**
   * Generate Refresh Token (7 days)
   */
  static generateRefreshToken(userId: string): string {
    return this.generateToken(
      {
        sub: userId,
        type: TokenType.REFRESH
      },
      { expiresIn: '7d' }
    );
  }

  /**
   * Generate Email Verification Token (24 hours)
   */
  static generateEmailVerificationToken(userId: string): string {
    return this.generateToken(
      {
        sub: userId,
        type: TokenType.EMAIL_VERIFICATION
      },
      { expiresIn: '24h' }
    );
  }

  /**
   * Generate Password Reset Token (1 hour)
   */
  static generatePasswordResetToken(userId: string): string {
    return this.generateToken(
      {
        sub: userId,
        type: TokenType.PASSWORD_RESET
      },
      { expiresIn: '1h' }
    );
  }

  /**
   * Verify JWT Token (Generic)
   */
  static verifyToken(token: string): TokenVerificationResult {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
      return { valid: true, payload: decoded };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Token expired' };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: 'Invalid token' };
      } else {
        return { valid: false, error: 'Token verification failed' };
      }
    }
  }

  /**
   * Verify Access Token
   */
  static verifyAccessToken(token: string): TokenVerificationResult {
    const result = this.verifyToken(token);
    if (result.valid && result.payload?.type === TokenType.ACCESS) {
      return result;
    }
    return { valid: false, error: 'Invalid access token' };
  }

  /**
   * Verify Refresh Token
   */
  static verifyRefreshToken(token: string): TokenVerificationResult {
    const result = this.verifyToken(token);
    if (result.valid && result.payload?.type === TokenType.REFRESH) {
      return result;
    }
    return { valid: false, error: 'Invalid refresh token' };
  }

  /**
   * Extract Token from Authorization Header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded || !decoded.exp) return true;
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded || !decoded.exp) return null;
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }

  /**
   * Should rotate refresh token (if > 50% expired)
   */
  static shouldRotateRefreshToken(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded || !decoded.exp || !decoded.iat) return false;

      const now = Math.floor(Date.now() / 1000);
      const tokenAge = now - decoded.iat;
      const tokenLifetime = decoded.exp - decoded.iat;

      return tokenAge > (tokenLifetime * 0.5);
    } catch {
      return true;
    }
  }

  // ========================================
  // PASSWORD OPERATIONS
  // ========================================

  /**
   * Hash Password (bcrypt with 12 rounds)
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify Password
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // ========================================
  // RANDOM TOKEN GENERATION
  // ========================================

  /**
   * Generate Secure Random Token (hex)
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate OTP (One-Time Password)
   */
  static generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }

  /**
   * Generate API Key
   */
  static generateApiKey(prefix: string = 'ak'): string {
    const randomPart = this.generateSecureToken(32);
    return `${prefix}_${randomPart}`;
  }

  /**
   * Generate CSRF Token
   */
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify CSRF Token
   */
  static verifyCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken;
  }

  /**
   * Generate Session ID
   */
  static generateSessionId(): string {
    return crypto.randomUUID();
  }

  /**
   * Generate Recovery Code
   */
  static generateRecoveryCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  // ========================================
  // SECURITY UTILITIES
  // ========================================

  /**
   * Hash Sensitive Data for Logging
   */
  static hashSensitiveData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
  }

  /**
   * Get Secure Cookie Options
   */
  static getSecureCookieOptions(isProduction: boolean = true): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
  } {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
  }

  // ========================================
  // RATE LIMITING (Mock - use Redis in production)
  // ========================================

  /**
   * Generate Rate Limit Key
   */
  static generateRateLimitKey(identifier: string, action: string): string {
    return `rate_limit:${action}:${identifier}`;
  }

  /**
   * Check Rate Limit (Mock implementation)
   * TODO: Use Redis in production
   */
  static async checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    // Mock implementation - always allow for now
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: Date.now() + windowMs
    };
  }
}
