import { Router } from 'express';
import { AuthController } from './controller.js';
import { AuthMiddleware } from '../../middlewares/auth.js';

export const authRouter = Router();
const authController = new AuthController();

// Apply security middleware to all auth routes
authRouter.use(AuthMiddleware.securityHeaders);
authRouter.use(AuthMiddleware.requestLogger);
authRouter.use(AuthMiddleware.validateContentType(['application/json']));
authRouter.use(AuthMiddleware.validateRequestSize(1024 * 1024)); // 1MB limit

// Public auth routes (no authentication required)
authRouter.post('/login', 
  AuthMiddleware.rateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  authController.login.bind(authController)
);

authRouter.post('/register', 
  AuthMiddleware.rateLimit(3, 60 * 60 * 1000), // 3 attempts per hour
  authController.register.bind(authController)
);

authRouter.post('/refresh', 
  AuthMiddleware.rateLimit(10, 60 * 1000), // 10 attempts per minute
  authController.refreshToken.bind(authController)
);

authRouter.post('/verify-email', 
  AuthMiddleware.rateLimit(5, 60 * 1000), // 5 attempts per minute
  authController.verifyEmail.bind(authController)
);

authRouter.post('/forgot-password', 
  AuthMiddleware.rateLimit(3, 60 * 60 * 1000), // 3 attempts per hour
  authController.forgotPassword.bind(authController)
);

authRouter.post('/reset-password',
  AuthMiddleware.rateLimit(5, 60 * 1000), // 5 attempts per minute
  authController.resetPassword.bind(authController)
);

authRouter.post('/resend-verification',
  AuthMiddleware.rateLimit(3, 60 * 60 * 1000), // 3 attempts per hour
  authController.resendVerification.bind(authController)
);

// Protected routes (authentication required)
authRouter.post('/logout',
  AuthMiddleware.authenticate,
  authController.logout.bind(authController)
);
