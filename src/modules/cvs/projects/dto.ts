import { z } from 'zod';

export const createProjectDto = z.object({
  name: z.string().min(1, 'Tên dự án không được để trống'),
  description: z.string().min(1, 'Mô tả dự án không được để trống'),
  startDate: z.string().datetime('Ngày bắt đầu không hợp lệ'),
  endDate: z.string().datetime('Ngày kết thúc không hợp lệ').optional(),
  url: z.string().url('URL dự án không hợp lệ').optional(),
  technologies: z.array(z.string()).optional(),
  role: z.string().optional(),
  teamSize: z.number().int().positive('Số lượng thành viên phải là số nguyên dương').optional(),
  achievements: z.string().optional(),
});
export type CreateProjectDto = z.infer<typeof createProjectDto>;

export const updateProjectDto = createProjectDto.partial();
export type UpdateProjectDto = z.infer<typeof updateProjectDto>;
