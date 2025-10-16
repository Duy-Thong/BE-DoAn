import { z } from 'zod';

export const createJobBenefitDto = z.object({
  title: z.string().min(1, 'Tiêu đề phúc lợi không được để trống'),
  description: z.string().optional(),
});

export const updateJobBenefitDto = createJobBenefitDto.partial();

export const jobBenefitResponse = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  jobId: z.string(),
});

export type CreateJobBenefitDto = z.infer<typeof createJobBenefitDto>;
export type UpdateJobBenefitDto = z.infer<typeof updateJobBenefitDto>;
export type JobBenefitResponse = z.infer<typeof jobBenefitResponse>;
