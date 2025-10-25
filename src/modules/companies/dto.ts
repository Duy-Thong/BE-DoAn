import { z } from 'zod';
import { CompanySize } from '../../generated/prisma/index.js';

// Create Company DTO
export const CreateCompanyDto = z.object({
  name: z.string()
    .min(1, 'Tên công ty không được để trống')
    .max(255, 'Tên công ty không được vượt quá 255 ký tự'),
  website: z.string()
    .url('Website phải là URL hợp lệ (ví dụ: https://example.com)')
    .optional()
    .nullable()
    .or(z.literal('')),
  description: z.string()
    .max(2000, 'Mô tả không được vượt quá 2000 ký tự')
    .optional()
    .nullable()
    .or(z.literal('')),
  industry: z.string()
    .max(100, 'Ngành nghề không được vượt quá 100 ký tự')
    .optional()
    .nullable()
    .or(z.literal('')),
  companySize: z.nativeEnum(CompanySize, {
    errorMap: () => ({ message: `Quy mô công ty phải là một trong: ${Object.values(CompanySize).join(', ')}` })
  }).optional().nullable(),
  foundedYear: z.coerce.number()
    .int('Năm thành lập phải là số nguyên')
    .min(1800, 'Năm thành lập không được nhỏ hơn 1800')
    .max(new Date().getFullYear(), `Năm thành lập không được lớn hơn ${new Date().getFullYear()}`)
    .optional()
    .nullable(),
  address: z.string()
    .max(500, 'Địa chỉ không được vượt quá 500 ký tự')
    .optional()
    .nullable()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]{10,15}$/, 'Số điện thoại không hợp lệ (10-15 chữ số)')
    .optional()
    .nullable()
    .or(z.literal('')),
  email: z.string()
    .email('Email không hợp lệ (ví dụ: user@example.com)')
    .optional()
    .nullable()
    .or(z.literal('')),
  logoUrl: z.string()
    .url('Logo URL phải là URL hợp lệ (ví dụ: https://example.com/logo.png)')
    .optional()
    .nullable()
    .or(z.literal('')),
  bannerUrl: z.string()
    .url('Banner URL phải là URL hợp lệ (ví dụ: https://example.com/banner.png)')
    .optional()
    .nullable()
    .or(z.literal('')),
});
export type CreateCompanyDto = z.infer<typeof CreateCompanyDto>;

// Update Company DTO
export const UpdateCompanyDto = z.object({
  name: z.string()
    .min(1, 'Tên công ty không được để trống')
    .max(255, 'Tên công ty không được vượt quá 255 ký tự')
    .optional(),
  website: z.string()
    .url('Website phải là URL hợp lệ (ví dụ: https://example.com)')
    .optional()
    .nullable()
    .or(z.literal('')),
  description: z.string()
    .max(2000, 'Mô tả không được vượt quá 2000 ký tự')
    .optional()
    .nullable()
    .or(z.literal('')),
  industry: z.string()
    .max(100, 'Ngành nghề không được vượt quá 100 ký tự')
    .optional()
    .nullable()
    .or(z.literal('')),
  companySize: z.nativeEnum(CompanySize, {
    errorMap: () => ({ message: `Quy mô công ty phải là một trong: ${Object.values(CompanySize).join(', ')}` })
  }).optional().nullable(),
  foundedYear: z.coerce.number()
    .int('Năm thành lập phải là số nguyên')
    .min(1800, 'Năm thành lập không được nhỏ hơn 1800')
    .max(new Date().getFullYear(), `Năm thành lập không được lớn hơn ${new Date().getFullYear()}`)
    .optional()
    .nullable(),
  address: z.string()
    .max(500, 'Địa chỉ không được vượt quá 500 ký tự')
    .optional()
    .nullable()
    .or(z.literal('')),
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]{10,15}$/, 'Số điện thoại không hợp lệ (10-15 chữ số)')
    .optional()
    .nullable()
    .or(z.literal('')),
  email: z.string()
    .email('Email không hợp lệ (ví dụ: user@example.com)')
    .optional()
    .nullable()
    .or(z.literal('')),
  logoUrl: z.string()
    .url('Logo URL phải là URL hợp lệ (ví dụ: https://example.com/logo.png)')
    .optional()
    .nullable()
    .or(z.literal('')),
  bannerUrl: z.string()
    .url('Banner URL phải là URL hợp lệ (ví dụ: https://example.com/banner.png)')
    .optional()
    .nullable()
    .or(z.literal('')),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
});
export type UpdateCompanyDto = z.infer<typeof UpdateCompanyDto>;

// Query/Filter DTO
export const CompanyQueryDto = z.object({
  page: z.coerce.number()
    .int('Trang phải là số nguyên')
    .min(1, 'Trang phải lớn hơn 0')
    .default(1),
  limit: z.coerce.number()
    .int('Giới hạn phải là số nguyên')
    .min(1, 'Giới hạn phải lớn hơn 0')
    .max(100, 'Giới hạn không được vượt quá 100')
    .default(10),
  search: z.string()
    .max(255, 'Từ khóa tìm kiếm không được vượt quá 255 ký tự')
    .optional(),
  industry: z.string()
    .max(100, 'Ngành nghề không được vượt quá 100 ký tự')
    .optional(),
  companySize: z.nativeEnum(CompanySize, {
    errorMap: () => ({ message: `Quy mô công ty phải là một trong: ${Object.values(CompanySize).join(', ')}` })
  }).optional(),
  isVerified: z.coerce.boolean()
    .optional(),
  isActive: z.coerce.boolean()
    .optional(),
  isEmailVerified: z.coerce.boolean()
    .optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name'], {
    errorMap: () => ({ message: 'Trường sắp xếp phải là: createdAt, updatedAt, hoặc name' })
  }).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc'], {
    errorMap: () => ({ message: 'Thứ tự sắp xếp phải là: asc hoặc desc' })
  }).default('desc'),
});
export type CompanyQueryDto = z.infer<typeof CompanyQueryDto>;

// Response DTO
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

