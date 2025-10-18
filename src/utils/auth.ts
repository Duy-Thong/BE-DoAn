/**
 * Authentication Utilities
 * Professional auth utilities for JWT, password, validation, and security
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { ErrorCode, ErrorCodeUtils } from './error-codes.js';
import { AppError } from './error.js';

/**
 * JWT Token Types
 */
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  API_KEY = 'api_key'
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
  subject?: string;
  jti?: string;
}

/**
 * Password Validation Rules
 */
export interface PasswordRules {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbiddenPatterns: RegExp[];
}

/**
 * Authentication Utilities Class
 */
export class AuthUtils {
  // Default password rules
  private static readonly DEFAULT_PASSWORD_RULES: PasswordRules = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    forbiddenPatterns: [
      /(.)\1{3,}/, // No 4+ consecutive identical characters
      /123456|abcdef|qwerty/i, // No common sequences
      /password|admin|user/i // No common words
    ]
  };

  /**
   * Generate JWT Token
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
      // Remove subject option since payload already has 'sub'
    } as jwt.SignOptions;

    return jwt.sign(tokenPayload, env.JWT_SECRET, tokenOptions);
  }

  /**
   * Generate Access Token
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
   * Generate Refresh Token
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
   * Generate Email Verification Token
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
   * Generate Password Reset Token
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
   * Verify JWT Token
   */
  static verifyToken(token: string): { valid: boolean; payload?: JWTPayload; error?: string } {
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
  static verifyAccessToken(token: string): { valid: boolean; payload?: JWTPayload; error?: string } {
    const result = this.verifyToken(token);
    if (result.valid && result.payload?.type === TokenType.ACCESS) {
      return result;
    }
    return { valid: false, error: 'Invalid access token' };
  }

  /**
   * Verify Refresh Token
   */
  static verifyRefreshToken(token: string): { valid: boolean; payload?: JWTPayload; error?: string } {
    const result = this.verifyToken(token);
    if (result.valid && result.payload?.type === TokenType.REFRESH) {
      return result;
    }
    return { valid: false, error: 'Invalid refresh token' };
  }

  /**
   * Hash Password
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

  /**
   * Validate Password Strength
   */
  static validatePassword(password: string, rules: PasswordRules = this.DEFAULT_PASSWORD_RULES): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Length validation
    if (password.length < rules.minLength) {
      errors.push(`Password must be at least ${rules.minLength} characters long`);
    }
    if (password.length > rules.maxLength) {
      errors.push(`Password must be no more than ${rules.maxLength} characters long`);
    }

    // Character requirements
    if (rules.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (rules.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (rules.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (rules.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Forbidden patterns
    for (const pattern of rules.forbiddenPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains forbidden patterns');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate Secure Random Token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate API Key
   */
  static generateApiKey(prefix: string = 'ak'): string {
    const randomPart = this.generateSecureToken(32);
    return `${prefix}_${randomPart}`;
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
   * Validate Email Format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate Phone Number Format
   */
  static validatePhoneNumber(phone: string): boolean {
    // International phone number format - remove all spaces and validate
    const cleanPhone = phone.replace(/\s/g, '');
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(cleanPhone);
  }

  /**
   * Sanitize Input
   */
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .substring(0, 1000); // Limit length
  }

  /**
   * Check for Suspicious Activity
   */
  static detectSuspiciousActivity(
    email: string,
    ip: string,
    userAgent: string,
    attempts: number
  ): { isSuspicious: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // Check for too many attempts
    if (attempts > 5) {
      reasons.push('Too many authentication attempts');
    }

    // Check for suspicious email patterns
    if (email.includes('+') && email.split('+').length > 2) {
      reasons.push('Suspicious email pattern');
    }

    // Check for suspicious user agent
    if (!userAgent || userAgent.length < 10) {
      reasons.push('Suspicious user agent');
    }

    // Check for common attack patterns
    const suspiciousPatterns = [
      /script/i,
      /javascript/i,
      /vbscript/i,
      /onload/i,
      /onerror/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(email) || pattern.test(userAgent)) {
        reasons.push('Potential XSS attempt');
        break;
      }
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons
    };
  }

  /**
   * Generate Rate Limit Key
   */
  static generateRateLimitKey(identifier: string, action: string): string {
    return `rate_limit:${action}:${identifier}`;
  }

  /**
   * Check Rate Limit
   */
  static async checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    // This would typically use Redis or similar
    // For now, return a mock implementation
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: Date.now() + windowMs
    };
  }

  /**
   * Create Authentication Error
   */
  static createAuthError(code: ErrorCode, message?: string): AppError {
    const errorMessage = message || ErrorCodeUtils.getErrorMessage(code);
    const statusCode = ErrorCodeUtils.getStatusCode(code);
    
    return new AppError(errorMessage, statusCode, true, code);
  }

  /**
   * Create Validation Error
   */
  static createValidationError(code: ErrorCode, details?: any): AppError {
    const errorMessage = ErrorCodeUtils.getErrorMessage(code);
    return new AppError(errorMessage, 400, true, code, details);
  }

  /**
   * Create Authorization Error
   */
  static createAuthorizationError(code: ErrorCode, message?: string): AppError {
    const errorMessage = message || ErrorCodeUtils.getErrorMessage(code);
    return new AppError(errorMessage, 403, true, code);
  }

  /**
   * Hash Sensitive Data for Logging
   */
  static hashSensitiveData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
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
   * Create Secure Cookie Options
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

  /**
   * Validate Token Expiration
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
   * Get Token Expiration Time
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
   * Refresh Token Rotation
   */
  static shouldRotateRefreshToken(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded || !decoded.exp || !decoded.iat) return false;
      
      const now = Math.floor(Date.now() / 1000);
      const tokenAge = now - decoded.iat;
      const tokenLifetime = decoded.exp - decoded.iat;
      
      // Rotate if token is more than 50% expired
      return tokenAge > (tokenLifetime * 0.5);
    } catch {
      return true;
    }
  }
}
