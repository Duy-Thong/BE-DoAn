import { z } from 'zod';

export const createJobSkillDto = z.object({
  skillName: z.string().min(1, 'Tên kỹ năng không được để trống'),
  isRequired: z.boolean().default(true),
});

export const updateJobSkillDto = createJobSkillDto.partial();

export const jobSkillResponse = z.object({
  id: z.string(),
  skillName: z.string(),
  isRequired: z.boolean(),
  jobId: z.string(),
});

export type CreateJobSkillDto = z.infer<typeof createJobSkillDto>;
export type UpdateJobSkillDto = z.infer<typeof updateJobSkillDto>;
export type JobSkillResponse = z.infer<typeof jobSkillResponse>;
