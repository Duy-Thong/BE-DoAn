import { z } from 'zod';
import { Gender } from '../../generated/prisma/index.js';

// ========================================
// INPUT DTOS - Only transformation, no validation
// ========================================

export const LoginDto = z.object({ 
  email: z.string().transform(email => email.toLowerCase().trim()),
  password: z.string()
});
export type LoginDto = z.infer<typeof LoginDto>;

export const RegisterDto = z.object({
  email: z.string().transform(email => email.toLowerCase().trim()),
  password: z.string(),
  fullName: z.string(),
  phoneNumber: z.string().optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  nationality: z.string().optional().nullable()
  // Note: role is NOT allowed in registration - always defaults to CANDIDATE
  // Only admins can assign roles via user creation endpoint
});
export type RegisterDto = z.infer<typeof RegisterDto>;

export const VerifyEmailDto = z.object({
  token: z.string()
});
export type VerifyEmailDto = z.infer<typeof VerifyEmailDto>;

export const ForgotPasswordDto = z.object({
  email: z.string().transform(email => email.toLowerCase().trim())
});
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDto>;

export const ResetPasswordDto = z.object({
  token: z.string(),
  password: z.string()
});
export type ResetPasswordDto = z.infer<typeof ResetPasswordDto>;

export const RefreshTokenDto = z.object({
  refreshToken: z.string()
});
export type RefreshTokenDto = z.infer<typeof RefreshTokenDto>;

export const ResendVerificationDto = z.object({
  email: z.string().transform(email => email.toLowerCase().trim())
});
export type ResendVerificationDto = z.infer<typeof ResendVerificationDto>;

// ========================================
// RESPONSE DTOS - Type definitions only
// ========================================

export const AuthResponse = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    fullName: z.string(),
    role: z.string(),
    companyId: z.string().nullable().optional(),
    isEmailVerified: z.boolean(),
    avatarUrl: z.string().nullable().optional()
  })
});
export type AuthResponse = z.infer<typeof AuthResponse>;

export const TokenResponse = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
});
export type TokenResponse = z.infer<typeof TokenResponse>;

export const MessageResponse = z.object({
  message: z.string()
});
export type MessageResponse = z.infer<typeof MessageResponse>;
