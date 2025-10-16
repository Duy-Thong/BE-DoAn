import { z } from 'zod';

export const createAchievementDto = z.object({
  title: z.string().min(1, 'Tiêu đề thành tích không được để trống'),
  description: z.string().min(1, 'Mô tả thành tích không được để trống'),
  date: z.string().datetime('Ngày đạt thành tích không hợp lệ'),
  issuer: z.string().optional(),
  category: z.string().optional(),
  url: z.string().url('URL thành tích không hợp lệ').optional(),
});
export type CreateAchievementDto = z.infer<typeof createAchievementDto>;

export const updateAchievementDto = createAchievementDto.partial();
export type UpdateAchievementDto = z.infer<typeof updateAchievementDto>;
