import { z } from 'zod';
import { Gender } from './enums.js';


export const setMainCVDto = z.object({
  cvId: z.string().cuid('ID CV không hợp lệ'),
});

export const CVResponse = z.object({
  id: z.string(),
  title: z.string(),
  fullName: z.string(),
  email: z.string(),
  phoneNumber: z.string().nullable(),
  dateOfBirth: z.date().nullable(),
  gender: z.nativeEnum(Gender).nullable(),
  nationality: z.string().nullable(),
  address: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  currentPosition: z.string().nullable(),
  summary: z.string().nullable(),
  objective: z.string().nullable(),
  isMain: z.boolean(),
  version: z.number(),
  lastGeneratedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
});

// DTOs for nested resources
export const workExperienceItemDto = z.object({
  title: z.string().min(1, 'Chức vụ không được để trống'),
  company: z.string().min(1, 'Công ty không được để trống'),
  startDate: z.string().datetime('Ngày bắt đầu không hợp lệ'),
  endDate: z.string().datetime().optional(),
  description: z.string().optional(),
});

export const educationItemDto = z.object({
  institution: z.string().min(1, 'Trường học không được để trống'),
  degree: z.string().min(1, 'Bằng cấp không được để trống'),
  startDate: z.string().datetime('Ngày bắt đầu không hợp lệ'),
  endDate: z.string().datetime().optional(),
  description: z.string().optional(),
});

export const skillItemDto = z.object({
  skillName: z.string().min(1, 'Tên kỹ năng không được để trống'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  yearsOfExperience: z.number().min(0).optional(),
  description: z.string().optional(),
});

export const projectItemDto = z.object({
  name: z.string().min(1, 'Tên dự án không được để trống'),
  description: z.string().optional(),
  startDate: z.string().datetime('Ngày bắt đầu không hợp lệ'),
  endDate: z.string().datetime().optional(),
  url: z.string().url().optional(),
  role: z.string().optional(),
});

export const certificationItemDto = z.object({
  name: z.string().min(1, 'Tên chứng chỉ không được để trống'),
  issuer: z.string().optional(),
  acquiredAt: z.string().datetime('Ngày cấp không hợp lệ'),
  description: z.string().optional(),
});

export const languageItemDto = z.object({
  name: z.string().min(1, 'Tên ngôn ngữ không được để trống'),
  proficiency: z.enum(['BASIC', 'CONVERSATIONAL', 'PROFESSIONAL', 'NATIVE'], {
    message: 'Trình độ ngôn ngữ không hợp lệ'
  }),
});

export const achievementItemDto = z.object({
  title: z.string().min(1, 'Tên thành tích không được để trống'),
  date: z.string().datetime('Ngày cấp không hợp lệ'),
  description: z.string().optional(),
});

export const referenceItemDto = z.object({
  name: z.string().min(1, 'Tên người tham khảo không được để trống'),
  position: z.string().optional(),
  company: z.string().optional(),
  description: z.string().optional(),
});

export const activityItemDto = z.object({
  title: z.string().min(1, 'Tên hoạt động không được để trống'),
  organization: z.string().optional(),
  startDate: z.string().datetime('Ngày bắt đầu không hợp lệ'),
  endDate: z.string().datetime().optional(),
  description: z.string().optional(),
});

// Complete CV DTO
export const createCompleteCVDto = z.object({
  // Basic CV info
  title: z.string().min(1, 'Tiêu đề CV không được để trống'),
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.nativeEnum(Gender).optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  currentPosition: z.string().optional(),
  summary: z.string().optional(),
  objective: z.string().optional(),
  isMain: z.boolean().default(false),
  
  // Nested data (optional)
  workExperience: z.array(workExperienceItemDto).optional(),
  education: z.array(educationItemDto).optional(),
  skills: z.array(skillItemDto).optional(),
  projects: z.array(projectItemDto).optional(),
  certifications: z.array(certificationItemDto).optional(),
  languages: z.array(languageItemDto).optional(),
  achievements: z.array(achievementItemDto).optional(),
  references: z.array(referenceItemDto).optional(),
  activities: z.array(activityItemDto).optional(),
});

// Update CV hoàn chỉnh với nested data
export const updateCompleteCVDto = z.object({
  // Basic CV info (optional)
  title: z.string().min(1, 'Tiêu đề CV không được để trống').optional(),
  fullName: z.string().min(1, 'Họ tên không được để trống').optional(),
  email: z.string().email('Email không hợp lệ').optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.nativeEnum(Gender).optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  currentPosition: z.string().optional(),
  summary: z.string().optional(),
  objective: z.string().optional(),
  isMain: z.boolean().optional(),
  
  // Nested data (optional) - nếu có thì sẽ replace toàn bộ
  workExperience: z.array(workExperienceItemDto).optional(),
  education: z.array(educationItemDto).optional(),
  skills: z.array(skillItemDto).optional(),
  projects: z.array(projectItemDto).optional(),
  certifications: z.array(certificationItemDto).optional(),
  languages: z.array(languageItemDto).optional(),
  achievements: z.array(achievementItemDto).optional(),
  references: z.array(referenceItemDto).optional(),
  activities: z.array(activityItemDto).optional(),
});

// DTO for duplicate CV
export const duplicateCVDto = z.object({
  title: z.string().min(1, 'Tiêu đề CV không được để trống'),
});

export type UpdateCompleteCVDto = z.infer<typeof updateCompleteCVDto>;
export type SetMainCVDto = z.infer<typeof setMainCVDto>;
export type CVResponse = z.infer<typeof CVResponse>;
export type CreateCompleteCVDto = z.infer<typeof createCompleteCVDto>;
export type DuplicateCVDto = z.infer<typeof duplicateCVDto>;
