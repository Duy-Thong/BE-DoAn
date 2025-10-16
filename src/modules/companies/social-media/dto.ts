import { z } from 'zod';

export const createCompanySocialMediaDto = z.object({
  platform: z.string().min(1, 'Nền tảng không được để trống'),
  url: z.string().url('URL không hợp lệ'),
  username: z.string().optional(),
  isPublic: z.boolean().default(true),
});
export type CreateCompanySocialMediaDto = z.infer<typeof createCompanySocialMediaDto>;

export const updateCompanySocialMediaDto = createCompanySocialMediaDto.partial();
export type UpdateCompanySocialMediaDto = z.infer<typeof updateCompanySocialMediaDto>;
