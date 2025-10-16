import { z } from 'zod';

export const createEducationDto = z.object({
  institution: z.string().min(1, 'Tên trường không được để trống'),
  degree: z.string().min(1, 'Bằng cấp không được để trống'),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().datetime('Ngày bắt đầu không hợp lệ'),
  endDate: z.string().datetime('Ngày kết thúc không hợp lệ').optional(),
  gpa: z.number().min(0).max(4).optional(),
  description: z.string().optional(),
});
export type CreateEducationDto = z.infer<typeof createEducationDto>;

export const updateEducationDto = createEducationDto.partial();
export type UpdateEducationDto = z.infer<typeof updateEducationDto>;
