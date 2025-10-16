import { Router } from 'express';
import { AuthController } from './controller.js';

export const authRouter = Router();
const authController = new AuthController();

// Auth routes
authRouter.post('/login', authController.login.bind(authController));
authRouter.post('/register', authController.register.bind(authController));
authRouter.post('/refresh', authController.refreshToken.bind(authController));
authRouter.post('/verify-email', authController.verifyEmail.bind(authController));
authRouter.post('/forgot-password', authController.forgotPassword.bind(authController));
authRouter.post('/reset-password', authController.resetPassword.bind(authController));
authRouter.post('/logout', authController.logout.bind(authController));