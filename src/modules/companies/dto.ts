import { z } from 'zod';

export const CreateCompanyDto = z.object({
  name: z.string().min(1, 'Tên công ty không được để trống'),
  website: z.string().url('Website không hợp lệ').optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.enum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email không hợp lệ').optional(),
  logoUrl: z.string().url('Logo URL không hợp lệ').optional(),
});
export type CreateCompanyDto = z.infer<typeof CreateCompanyDto>;

export const UpdateCompanyDto = CreateCompanyDto.partial().extend({
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
});
export type UpdateCompanyDto = z.infer<typeof UpdateCompanyDto>;

export const CompanyResponse = z.object({
  id: z.string(),
  name: z.string(),
  website: z.string().nullable(),
  description: z.string().nullable(),
  industry: z.string().nullable(),
  companySize: z.enum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).nullable(),
  foundedYear: z.number().int().nullable(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  logoUrl: z.string().nullable(),
  isVerified: z.boolean(),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type CompanyResponse = z.infer<typeof CompanyResponse>;

// Social Media DTOs
export const CreateSocialMediaDto = z.object({
  platform: z.string().min(1, 'Platform không được để trống'),
  url: z.string().url('URL không hợp lệ'),
  isVerified: z.boolean().default(false),
});
export type CreateSocialMediaDto = z.infer<typeof CreateSocialMediaDto>;

export const UpdateSocialMediaDto = CreateSocialMediaDto.partial();
export type UpdateSocialMediaDto = z.infer<typeof UpdateSocialMediaDto>;

export const SocialMediaResponse = z.object({
  id: z.string(),
  platform: z.string(),
  url: z.string(),
  isVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type SocialMediaResponse = z.infer<typeof SocialMediaResponse>;

