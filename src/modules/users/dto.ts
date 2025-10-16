import { z } from 'zod';

export const CreateUserDto = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  nationality: z.string().optional(),
  role: z.enum(['ADMIN', 'RECRUITER', 'CANDIDATE']).default('CANDIDATE'),
  avatarUrl: z.string().url().optional(),
});
export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const UpdateUserDto = CreateUserDto.partial().omit({ password: true }).extend({
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional(),
  isActive: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
});
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

export const UserResponse = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  phoneNumber: z.string().nullable(),
  dateOfBirth: z.date().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).nullable(),
  nationality: z.string().nullable(),
  role: z.enum(['ADMIN', 'RECRUITER', 'CANDIDATE']),
  isActive: z.boolean(),
  isLocked: z.boolean(),
  isEmailVerified: z.boolean(),
  lastLoginAt: z.date().nullable(),
  avatarUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type UserResponse = z.infer<typeof UserResponse>;

