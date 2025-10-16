import { z } from 'zod';

export const LoginDto = z.object({ 
  email: z.string().email('Email không hợp lệ'), 
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự') 
});
export type LoginDto = z.infer<typeof LoginDto>;

export const RegisterDto = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  nationality: z.string().optional(),
  role: z.enum(['CANDIDATE', 'RECRUITER', 'ADMIN']).default('CANDIDATE')
});
export type RegisterDto = z.infer<typeof RegisterDto>;

export const VerifyEmailDto = z.object({
  token: z.string().min(1, 'Token không được để trống')
});
export type VerifyEmailDto = z.infer<typeof VerifyEmailDto>;

export const ForgotPasswordDto = z.object({
  email: z.string().email('Email không hợp lệ')
});
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDto>;

export const ResetPasswordDto = z.object({
  token: z.string().min(1, 'Token không được để trống'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
});
export type ResetPasswordDto = z.infer<typeof ResetPasswordDto>;

export const RefreshTokenDto = z.object({
  refreshToken: z.string().min(1, 'Refresh token không được để trống')
});
export type RefreshTokenDto = z.infer<typeof RefreshTokenDto>;

export const AuthResponse = z.object({
  token: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    fullName: z.string(),
    role: z.string(),
    isEmailVerified: z.boolean(),
    avatarUrl: z.string().nullable()
  })
});
export type AuthResponse = z.infer<typeof AuthResponse>;
