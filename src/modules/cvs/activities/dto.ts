import { z } from 'zod';

export const createActivityDto = z.object({
  name: z.string().min(1, 'Tên hoạt động không được để trống'),
  organization: z.string().min(1, 'Tổ chức không được để trống'),
  position: z.string().optional(),
  startDate: z.string().datetime('Ngày bắt đầu không hợp lệ'),
  endDate: z.string().datetime('Ngày kết thúc không hợp lệ').optional(),
  description: z.string().optional(),
  achievements: z.string().optional(),
  url: z.string().url('URL hoạt động không hợp lệ').optional(),
});
export type CreateActivityDto = z.infer<typeof createActivityDto>;

export const updateActivityDto = createActivityDto.partial();
export type UpdateActivityDto = z.infer<typeof updateActivityDto>;
