import { z } from 'zod';
import { Gender, UserRole } from '../../generated/prisma/index.js';

// Create User DTO - Only transformation, no validation
export const CreateUserDto = z.object({
  email: z.string().transform(email => email.toLowerCase().trim()),
  password: z.string(),
  fullName: z.string(),
  phoneNumber: z.string().optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  nationality: z.string().optional().nullable(),
  role: z.nativeEnum(UserRole).default(UserRole.CANDIDATE),
  avatarUrl: z.string().url().optional().nullable(),
  companyId: z.string().uuid().optional().nullable(),
});
export type CreateUserDto = z.infer<typeof CreateUserDto>;

// Update User DTO - Only transformation, no validation
export const UpdateUserDto = z.object({
  email: z.string().transform(email => email.toLowerCase().trim()).optional(),
  password: z.string().optional(),
  fullName: z.string().optional(),
  phoneNumber: z.string().optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  nationality: z.string().optional().nullable(),
  role: z.nativeEnum(UserRole).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
  companyId: z.string().uuid().optional().nullable(),
});
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

// Query/Filter DTO - Only transformation, no validation
export const UserQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.string().optional().transform(val => {
    if (val === '' || val === undefined || val === null) return undefined;
    return val === 'true';
  }),
  isLocked: z.string().optional().transform(val => {
    if (val === '' || val === undefined || val === null) return undefined;
    return val === 'true';
  }),
  isEmailVerified: z.string().optional().transform(val => {
    if (val === '' || val === undefined || val === null) return undefined;
    return val === 'true';
  }),
  companyId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'fullName', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type UserQueryDto = z.infer<typeof UserQueryDto>;

// Response DTOs
export const UserResponseDto = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  phoneNumber: z.string().nullable(),
  dateOfBirth: z.date().nullable(),
  gender: z.nativeEnum(Gender).nullable(),
  nationality: z.string().nullable(),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean(),
  isLocked: z.boolean(),
  isEmailVerified: z.boolean(),
  lastLoginAt: z.date().nullable(),
  avatarUrl: z.string().nullable(),
  companyId: z.string().nullable(),
  companyRole: z.string().nullable(),
  joinedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type UserResponseDto = z.infer<typeof UserResponseDto>;
