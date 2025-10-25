import { z } from 'zod';

// Create CV Template DTO
export const CreateCVTemplateDto = z.object({
  name: z.string()
    .min(1, 'Tên template không được để trống')
    .max(100, 'Tên template không được vượt quá 100 ký tự'),
  slug: z.string()
    .min(1, 'Slug không được để trống')
    .max(100, 'Slug không được vượt quá 100 ký tự')
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'),
  description: z.string()
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .optional()
    .nullable()
    .or(z.literal('')),
  category: z.enum(['professional', 'creative', 'academic', 'minimal', 'modern', 'classic'], {
    errorMap: () => ({ message: 'Danh mục phải là: professional, creative, academic, minimal, modern, hoặc classic' })
  }),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  isPremium: z.boolean().default(false),
  
  // Template metadata
  version: z.string()
    .regex(/^\d+\.\d+\.\d+$/, 'Phiên bản phải có định dạng x.y.z (ví dụ: 1.0.0)')
    .default('1.0.0'),
  author: z.string()
    .max(100, 'Tác giả không được vượt quá 100 ký tự')
    .optional()
    .nullable()
    .or(z.literal('')),
  tags: z.array(z.string())
    .max(10, 'Không được có quá 10 tags')
    .default([]),
  
  // Preview image
  previewUrl: z.string()
    .url('URL preview không hợp lệ')
    .optional()
    .nullable()
    .or(z.literal('')),
});
export type CreateCVTemplateDto = z.infer<typeof CreateCVTemplateDto>;

// Update CV Template DTO
export const UpdateCVTemplateDto = z.object({
  name: z.string()
    .min(1, 'Tên template không được để trống')
    .max(100, 'Tên template không được vượt quá 100 ký tự')
    .optional(),
  slug: z.string()
    .min(1, 'Slug không được để trống')
    .max(100, 'Slug không được vượt quá 100 ký tự')
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang')
    .optional(),
  description: z.string()
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .optional()
    .nullable()
    .or(z.literal('')),
  category: z.enum(['professional', 'creative', 'academic', 'minimal', 'modern', 'classic'], {
    errorMap: () => ({ message: 'Danh mục phải là: professional, creative, academic, minimal, modern, hoặc classic' })
  }).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  
  // Template metadata
  version: z.string()
    .regex(/^\d+\.\d+\.\d+$/, 'Phiên bản phải có định dạng x.y.z (ví dụ: 1.0.0)')
    .optional(),
  author: z.string()
    .max(100, 'Tác giả không được vượt quá 100 ký tự')
    .optional()
    .nullable()
    .or(z.literal('')),
  tags: z.array(z.string())
    .max(10, 'Không được có quá 10 tags')
    .optional(),
  
  // Preview image
  previewUrl: z.string()
    .url('URL preview không hợp lệ')
    .optional()
    .nullable()
    .or(z.literal('')),
});
export type UpdateCVTemplateDto = z.infer<typeof UpdateCVTemplateDto>;

// Query/Filter DTO
export const CVTemplateQueryDto = z.object({
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
  category: z.enum(['professional', 'creative', 'academic', 'minimal', 'modern', 'classic'])
    .optional(),
  isActive: z.coerce.boolean().optional(),
  isDefault: z.coerce.boolean().optional(),
  isPremium: z.coerce.boolean().optional(),
  tags: z.string()
    .optional()
    .transform(val => val ? val.split(',').map(tag => tag.trim()) : undefined),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'usageCount', 'downloadCount'], {
    errorMap: () => ({ message: 'Trường sắp xếp phải là: createdAt, updatedAt, name, usageCount, hoặc downloadCount' })
  }).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc'], {
    errorMap: () => ({ message: 'Thứ tự sắp xếp phải là: asc hoặc desc' })
  }).default('desc'),
});
export type CVTemplateQueryDto = z.infer<typeof CVTemplateQueryDto>;

// Response DTO
export const CVTemplateResponseDto = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  isPremium: z.boolean(),
  version: z.string(),
  author: z.string().nullable(),
  tags: z.array(z.string()),
  htmlUrl: z.string().nullable(),
  cssUrl: z.string().nullable(),
  jsUrl: z.string().nullable(),
  previewUrl: z.string().nullable(),
  usageCount: z.number(),
  downloadCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
});
export type CVTemplateResponseDto = z.infer<typeof CVTemplateResponseDto>;

// Template content DTO (for getting full template with content)
export const CVTemplateContentDto = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  isPremium: z.boolean(),
  htmlContent: z.string(),
  cssContent: z.string().nullable(),
  jsContent: z.string().nullable(),
  htmlUrl: z.string().nullable(),
  cssUrl: z.string().nullable(),
  jsUrl: z.string().nullable(),
  previewUrl: z.string().nullable(),
  version: z.string(),
  author: z.string().nullable(),
  tags: z.array(z.string()),
  usageCount: z.number(),
  downloadCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type CVTemplateContentDto = z.infer<typeof CVTemplateContentDto>;

// Template upload DTO
export const CVTemplateUploadDto = z.object({
  templateId: z.string().cuid('ID template không hợp lệ'),
  fileType: z.enum(['html', 'css', 'js', 'preview'], {
    errorMap: () => ({ message: 'Loại file phải là: html, css, js, hoặc preview' })
  }),
});
export type CVTemplateUploadDto = z.infer<typeof CVTemplateUploadDto>;

// Template usage DTO
export const CVTemplateUsageDto = z.object({
  templateId: z.string().cuid('ID template không hợp lệ'),
  action: z.enum(['view', 'download', 'use'], {
    errorMap: () => ({ message: 'Hành động phải là: view, download, hoặc use' })
  }),
});
export type CVTemplateUsageDto = z.infer<typeof CVTemplateUsageDto>;
