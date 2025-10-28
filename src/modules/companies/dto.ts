import { z } from 'zod';
import { CompanySize } from '../../generated/prisma/index.js';

// ========================================
// INPUT DTOS - Only transformation, no validation
// ========================================

export const CreateCompanyDto = z.object({
  name: z.string(),
  website: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  companySize: z.nativeEnum(CompanySize).optional().nullable(),
  foundedYear: z.coerce.number().int().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
});
export type CreateCompanyDto = z.infer<typeof CreateCompanyDto>;

export const UpdateCompanyDto = z.object({
  name: z.string().optional(),
  website: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  companySize: z.nativeEnum(CompanySize).optional().nullable(),
  foundedYear: z.coerce.number().int().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
});
export type UpdateCompanyDto = z.infer<typeof UpdateCompanyDto>;

export const CompanyQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.nativeEnum(CompanySize).optional(),
  isVerified: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  isEmailVerified: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type CompanyQueryDto = z.infer<typeof CompanyQueryDto>;

// ========================================
// RESPONSE DTOS - Type definitions only
// ========================================

export const CompanyResponseDto = z.object({
  id: z.string(),
  name: z.string(),
  website: z.string().nullable(),
  description: z.string().nullable(),
  industry: z.string().nullable(),
  companySize: z.nativeEnum(CompanySize).nullable(),
  foundedYear: z.number().nullable(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  logoUrl: z.string().nullable(),
  bannerUrl: z.string().nullable(),
  isVerified: z.boolean(),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type CompanyResponseDto = z.infer<typeof CompanyResponseDto>;

