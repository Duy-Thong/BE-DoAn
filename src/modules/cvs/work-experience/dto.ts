import { z } from 'zod';

export const createWorkExperienceDto = z.object({
  title: z.string().min(1, 'Chức vụ không được để trống'),
  company: z.string().min(1, 'Tên công ty không được để trống'),
  startDate: z.string().datetime('Ngày bắt đầu không hợp lệ'),
  endDate: z.string().datetime('Ngày kết thúc không hợp lệ').optional(),
  description: z.string().optional(),
});

export const updateWorkExperienceDto = createWorkExperienceDto.partial();

export const workExperienceResponse = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  startDate: z.date(),
  endDate: z.date().nullable(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  cvId: z.string(),
});

export type CreateWorkExperienceDto = z.infer<typeof createWorkExperienceDto>;
export type UpdateWorkExperienceDto = z.infer<typeof updateWorkExperienceDto>;
export type WorkExperienceResponse = z.infer<typeof workExperienceResponse>;
