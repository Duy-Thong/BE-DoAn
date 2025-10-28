import { Router } from 'express';
import { AuthController } from './controller.js';
import { AuthMiddleware } from '../../middlewares/auth.js';

/**
 * Auth Routes
 * Handles authentication endpoints
 * Uses AuthController for request handling
 */
export const authRouter = Router();
const authController = new AuthController();

// ========================================
// MIDDLEWARE
// ========================================
authRouter.use(AuthMiddleware.securityHeaders);
authRouter.use(AuthMiddleware.requestLogger);
authRouter.use(AuthMiddleware.validateRequestSize(1024 * 1024)); // 1MB limit

// ========================================
// PUBLIC ROUTES (no authentication required)
// ========================================

// Login
authRouter.post('/login', 
  AuthMiddleware.validateContentType(['application/json']),
  AuthMiddleware.rateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  authController.login.bind(authController)
);

// Register
authRouter.post('/register', 
  AuthMiddleware.validateContentType(['application/json']),
  AuthMiddleware.rateLimit(3, 60 * 60 * 1000), // 3 attempts per hour
  authController.register.bind(authController)
);

// Refresh Token
authRouter.post('/refresh', 
  AuthMiddleware.validateContentType(['application/json']),
  AuthMiddleware.rateLimit(10, 60 * 1000), // 10 attempts per minute
  authController.refreshToken.bind(authController)
);

// Email Verification
authRouter.post('/verify-email', 
  AuthMiddleware.validateContentType(['application/json']),
  AuthMiddleware.rateLimit(5, 60 * 1000), // 5 attempts per minute
  authController.verifyEmail.bind(authController)
);

// Forgot Password
authRouter.post('/forgot-password', 
  AuthMiddleware.validateContentType(['application/json']),
  AuthMiddleware.rateLimit(3, 60 * 60 * 1000), // 3 attempts per hour
  authController.forgotPassword.bind(authController)
);

// Reset Password
authRouter.post('/reset-password',
  AuthMiddleware.validateContentType(['application/json']),
  AuthMiddleware.rateLimit(5, 60 * 1000), // 5 attempts per minute
  authController.resetPassword.bind(authController)
);

// Resend Verification
authRouter.post('/resend-verification',
  AuthMiddleware.validateContentType(['application/json']),
  AuthMiddleware.rateLimit(3, 60 * 60 * 1000), // 3 attempts per hour
  authController.resendVerification.bind(authController)
);

// ========================================
// PROTECTED ROUTES (authentication required)
// ========================================

// Logout
authRouter.post('/logout',
  AuthMiddleware.validateContentType(['application/json']),
  AuthMiddleware.authenticate,
  authController.logout.bind(authController)
);
