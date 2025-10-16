import { z } from 'zod';

export const createSocialMediaDto = z.object({
  platform: z.string().min(1, 'Nền tảng không được để trống'),
  url: z.string().url('URL không hợp lệ'),
  username: z.string().optional(),
  isPublic: z.boolean().default(true),
});
export type CreateSocialMediaDto = z.infer<typeof createSocialMediaDto>;

export const updateSocialMediaDto = createSocialMediaDto.partial();
export type UpdateSocialMediaDto = z.infer<typeof updateSocialMediaDto>;
