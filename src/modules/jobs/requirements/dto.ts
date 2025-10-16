import { z } from 'zod';

export const createJobRequirementDto = z.object({
  title: z.string().min(1, 'Tiêu đề yêu cầu không được để trống'),
  description: z.string().optional(),
});

export const updateJobRequirementDto = createJobRequirementDto.partial();

export const jobRequirementResponse = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  jobId: z.string(),
});

export type CreateJobRequirementDto = z.infer<typeof createJobRequirementDto>;
export type UpdateJobRequirementDto = z.infer<typeof updateJobRequirementDto>;
export type JobRequirementResponse = z.infer<typeof jobRequirementResponse>;
