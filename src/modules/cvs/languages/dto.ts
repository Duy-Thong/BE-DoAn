import { z } from 'zod';

export const createLanguageDto = z.object({
  language: z.string().min(1, 'Tên ngôn ngữ không được để trống'),
  proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'NATIVE']),
  certification: z.string().optional(),
});
export type CreateLanguageDto = z.infer<typeof createLanguageDto>;

export const updateLanguageDto = createLanguageDto.partial();
export type UpdateLanguageDto = z.infer<typeof updateLanguageDto>;
