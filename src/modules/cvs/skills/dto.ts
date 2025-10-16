import { z } from 'zod';

export const createCVSkillDto = z.object({
  skillName: z.string().min(1, 'Tên kỹ năng không được để trống'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'], {
    errorMap: () => ({ message: 'Cấp độ kỹ năng không hợp lệ' })
  }),
  yearsOfExperience: z.number().int().min(0).max(50).optional(),
  description: z.string().optional(),
});

export const updateCVSkillDto = createCVSkillDto.partial();

export const cvSkillResponse = z.object({
  id: z.string(),
  skillName: z.string(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  yearsOfExperience: z.number().int().nullable(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  cvId: z.string(),
});

export type CreateCVSkillDto = z.infer<typeof createCVSkillDto>;
export type UpdateCVSkillDto = z.infer<typeof updateCVSkillDto>;
export type CVSkillResponse = z.infer<typeof cvSkillResponse>;
