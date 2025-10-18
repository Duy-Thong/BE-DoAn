/**
 * Authentication Middleware
 * Professional authentication and authorization middleware
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../loaders/prisma.js';
import { AuthUtils } from '../utils/auth.js';
import { ErrorCode, ErrorCodeUtils } from '../utils/error-codes.js';
import { ResponseUtils } from '../utils/response.js';
import { AppError } from '../utils/error.js';
import { UserRole as PrismaUserRole } from '../generated/prisma/index.js';

/**
 * Extended Request Interface with User
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    companyId?: string;
    isActive: boolean;
    isLocked: boolean;
    isEmailVerified: boolean;
  };
  token?: string;
}

/**
 * Role-based Access Control - Use Prisma-generated enum
 */
export const UserRole = PrismaUserRole;
export type UserRole = PrismaUserRole;

/**
 * Company Role-based Access Control
 */
export enum CompanyRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  RECRUITER = 'RECRUITER',
  VIEWER = 'VIEWER'
}

/**
 * Authentication Middleware
 */
export class AuthMiddleware {
  /**
   * Verify JWT Token and Attach User to Request
   */
  static authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      const token = AuthUtils.extractTokenFromHeader(authHeader);

      if (!token) {
        const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTH_TOKEN_MISSING);
        return ResponseUtils.unauthorized(res, errorResponse.error);
      }

      // Verify token
      const tokenResult = AuthUtils.verifyAccessToken(token);
      if (!tokenResult.valid || !tokenResult.payload) {
        const errorCode = tokenResult.error === 'Token expired' 
          ? ErrorCode.AUTH_TOKEN_EXPIRED 
          : ErrorCode.AUTH_TOKEN_INVALID;
        const errorResponse = ErrorCodeUtils.createErrorResponse(errorCode);
        return ResponseUtils.unauthorized(res, errorResponse.error);
      }

      const { sub: userId, role, companyId } = tokenResult.payload;

      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          companyId: true,
          isActive: true,
          isLocked: true,
          isEmailVerified: true
        }
      });

      if (!user) {
        const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.BIZ_USER_NOT_FOUND);
        return ResponseUtils.unauthorized(res, errorResponse.error);
      }

      // Check if user is active
      if (!user.isActive) {
        const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTH_ACCOUNT_INACTIVE);
        return ResponseUtils.unauthorized(res, errorResponse.error);
      }

      // Check if user is locked
      if (user.isLocked) {
        const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTH_ACCOUNT_LOCKED);
        return ResponseUtils.unauthorized(res, errorResponse.error);
      }

      // Attach user and token to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        isActive: user.isActive,
        isLocked: user.isLocked,
        isEmailVerified: user.isEmailVerified
      };
      req.token = token;

      next();
    } catch (error) {
      const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTH_TOKEN_INVALID);
      return ResponseUtils.unauthorized(res, errorResponse.error);
    }
  };

  /**
   * Optional Authentication (doesn't fail if no token)
   */
  static optionalAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = AuthUtils.extractTokenFromHeader(authHeader);

      if (token) {
        const tokenResult = AuthUtils.verifyAccessToken(token);
        if (tokenResult.valid && tokenResult.payload) {
          const { sub: userId } = tokenResult.payload;
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              email: true,
              role: true,
              companyId: true,
              isActive: true,
              isLocked: true,
              isEmailVerified: true
            }
          });

          if (user && user.isActive && !user.isLocked) {
            req.user = {
              id: user.id,
              email: user.email,
              role: user.role,
              companyId: user.companyId,
              isActive: user.isActive,
              isLocked: user.isLocked,
              isEmailVerified: user.isEmailVerified
            };
            req.token = token;
          }
        }
      }

      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  };

  /**
   * Require Specific Role
   */
  static requireRole = (requiredRole: UserRole) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTH_TOKEN_MISSING);
        return ResponseUtils.unauthorized(res, errorResponse.error);
      }

      if (req.user.role !== requiredRole) {
        const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTHZ_ROLE_REQUIRED);
        return ResponseUtils.forbidden(res, errorResponse.error);
      }

      next();
    };
  };

  /**
   * Require Admin Role
   */
  static requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTH_TOKEN_MISSING);
      return ResponseUtils.unauthorized(res, errorResponse.error);
    }

    if (req.user.role !== UserRole.ADMIN) {
      const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTHZ_ADMIN_REQUIRED);
      return ResponseUtils.forbidden(res, errorResponse.error);
    }

    next();
  };

  /**
   * Require Recruiter Role
   */
  static requireRecruiter = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTH_TOKEN_MISSING);
      return ResponseUtils.unauthorized(res, errorResponse.error);
    }

    if (req.user.role !== UserRole.RECRUITER) {
      const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTHZ_RECRUITER_REQUIRED);
      return ResponseUtils.forbidden(res, errorResponse.error);
    }

    next();
  };

  /**
   * Require Candidate Role
   */
  static requireCandidate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTH_TOKEN_MISSING);
      return ResponseUtils.unauthorized(res, errorResponse.error);
    }

    if (req.user.role !== UserRole.CANDIDATE) {
      const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTHZ_CANDIDATE_REQUIRED);
      return ResponseUtils.forbidden(res, errorResponse.error);
    }

    next();
  };

  /**
   * Require Recruiter or Admin Role
   */
  static requireRecruiterOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTH_TOKEN_MISSING);
      return ResponseUtils.unauthorized(res, errorResponse.error);
    }

    if (req.user.role !== UserRole.RECRUITER && req.user.role !== UserRole.ADMIN) {
      const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTHZ_ROLE_REQUIRED);
      return ResponseUtils.forbidden(res, errorResponse.error);
    }

    next();
  };

  /**
   * Require Any of Multiple Roles
   */
  static requireAnyRole = (roles: UserRole[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTH_TOKEN_MISSING);
        return ResponseUtils.unauthorized(res, errorResponse.error);
      }

      if (!roles.includes(req.user.role as UserRole)) {
        const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTHZ_ROLE_REQUIRED);
        return ResponseUtils.forbidden(res, errorResponse.error);
      }

      next();
    };
  };

  /**
   * Require Email Verification
   */
  static requireEmailVerification = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTH_TOKEN_MISSING);
      return ResponseUtils.unauthorized(res, errorResponse.error);
    }

    if (!req.user.isEmailVerified) {
      const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTH_EMAIL_NOT_VERIFIED);
      return ResponseUtils.unauthorized(res, errorResponse.error);
    }

    next();
  };

  /**
   * Require Company Access
   */
  static requireCompanyAccess = (companyIdParam: string = 'companyId') => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTH_TOKEN_MISSING);
          return ResponseUtils.unauthorized(res, errorResponse.error);
        }

        const targetCompanyId = req.params[companyIdParam];
        if (!targetCompanyId) {
          const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.VAL_REQUIRED_FIELD);
          return ResponseUtils.badRequest(res, errorResponse.error);
        }

        // Admin can access any company
        if (req.user.role === UserRole.ADMIN) {
          return next();
        }

        // Check if user belongs to the company
        if (req.user.companyId !== targetCompanyId) {
          const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTHZ_COMPANY_ACCESS_DENIED);
          return ResponseUtils.forbidden(res, errorResponse.error);
        }

        next();
      } catch (error) {
        const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.SYS_INTERNAL_ERROR);
        return ResponseUtils.internalError(res, errorResponse.error);
      }
    };
  };

  /**
   * Require Resource Ownership or Admin
   */
  static requireOwnershipOrAdmin = (userIdParam: string = 'userId') => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTH_TOKEN_MISSING);
        return ResponseUtils.unauthorized(res, errorResponse.error);
      }

      const targetUserId = req.params[userIdParam];
      
      // Admin can access any resource
      if (req.user.role === UserRole.ADMIN) {
        return next();
      }

      // Check if user owns the resource
      if (req.user.id !== targetUserId) {
        const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.AUTHZ_RESOURCE_ACCESS_DENIED);
        return ResponseUtils.forbidden(res, errorResponse.error);
      }

      next();
    };
  };

  /**
   * Rate Limiting Middleware
   */
  static rateLimit = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const identifier = req.user?.id || req.ip || 'anonymous';
        const key = AuthUtils.generateRateLimitKey(identifier, req.path);
        
        const rateLimitResult = await AuthUtils.checkRateLimit(key, maxAttempts, windowMs);
        
        if (!rateLimitResult.allowed) {
          const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.RATE_LIMIT_EXCEEDED);
          return ResponseUtils.tooManyRequests(res, errorResponse.error);
        }

        // Add rate limit headers
        res.set({
          'X-RateLimit-Limit': maxAttempts.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        });

        next();
      } catch (error) {
        // Continue on rate limit check failure
        next();
      }
    };
  };

  /**
   * Security Headers Middleware
   */
  static securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
    // Remove sensitive headers
    res.removeHeader('X-Powered-By');
    
    // Add security headers
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    });

    next();
  };

  /**
   * Request Logging Middleware
   */
  static requestLogger = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    const userInfo = req.user ? `${req.user.id}:${req.user.email}` : 'anonymous';
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logData = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        user: userInfo,
        timestamp: new Date().toISOString()
      };

      if (res.statusCode >= 400) {
        console.warn('Request Error:', logData);
      } else {
        console.info('Request:', logData);
      }
    });

    next();
  };

  /**
   * Validate Request Size
   */
  static validateRequestSize = (maxSize: number = 10 * 1024 * 1024) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const contentLength = parseInt(req.get('Content-Length') || '0');
      
      if (contentLength > maxSize) {
        const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.FILE_TOO_LARGE);
        return ResponseUtils.error(res, errorResponse.error, 413);
      }

      next();
    };
  };

  /**
   * Validate Content Type
   */
  static validateContentType = (allowedTypes: string[] = ['application/json']) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (req.method === 'GET' || req.method === 'DELETE') {
        return next();
      }

      const contentType = req.get('Content-Type');
      if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
        const errorResponse = ErrorCodeUtils.createErrorResponse(ErrorCode.VAL_INVALID_FORMAT);
        return ResponseUtils.error(res, errorResponse.error, 415);
      }

      next();
    };
  };
}

/**
 * Convenience exports
 */
export const {
  authenticate,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireRecruiter,
  requireCandidate,
  requireRecruiterOrAdmin,
  requireAnyRole,
  requireEmailVerification,
  requireCompanyAccess,
  requireOwnershipOrAdmin,
  rateLimit,
  securityHeaders,
  requestLogger,
  validateRequestSize,
  validateContentType
} = AuthMiddleware;

/**
 * Legacy export for backward compatibility
 */
export const authMiddleware = AuthMiddleware.authenticate;