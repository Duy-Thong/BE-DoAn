import { z } from 'zod';

// Common validation schemas
const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .max(255, 'Email too long')
  .transform(email => email.toLowerCase().trim());

const passwordSchema = z.string()
  .min(1, 'Password is required');

const phoneSchema = z.string()
  .optional()
  .or(z.literal(''));

const fullNameSchema = z.string()
  .min(1, 'Full name is required');

export const LoginDto = z.object({ 
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});
export type LoginDto = z.infer<typeof LoginDto>;

export const RegisterDto = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  phoneNumber: phoneSchema,
  dateOfBirth: z.string().datetime().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  nationality: z.string().max(100, 'Nationality too long').optional().or(z.literal(''))
  // Note: role is NOT allowed in registration - always defaults to CANDIDATE
  // Only admins can assign roles via user creation endpoint
});
export type RegisterDto = z.infer<typeof RegisterDto>;

export const VerifyEmailDto = z.object({
  token: z.string()
    .min(1, 'Token is required')
    .max(1000, 'Token too long')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid token format')
});
export type VerifyEmailDto = z.infer<typeof VerifyEmailDto>;

export const ForgotPasswordDto = z.object({
  email: emailSchema
});
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDto>;

export const ResetPasswordDto = z.object({
  token: z.string()
    .min(1, 'Token is required')
    .max(1000, 'Token too long')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid token format'),
  password: passwordSchema
});
export type ResetPasswordDto = z.infer<typeof ResetPasswordDto>;

export const RefreshTokenDto = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token is required')
    .max(2000, 'Refresh token too long')
});
export type RefreshTokenDto = z.infer<typeof RefreshTokenDto>;

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

export const ResendVerificationDto = z.object({
  email: emailSchema
});
export type ResendVerificationDto = z.infer<typeof ResendVerificationDto>;
