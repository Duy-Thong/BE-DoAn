import { z } from 'zod';

export const CreateJobDto = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().optional(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional(),
  companyId: z.string(),
});
export type CreateJobDto = z.infer<typeof CreateJobDto>;

export const UpdateJobDto = CreateJobDto.partial();
export type UpdateJobDto = z.infer<typeof UpdateJobDto>;

export const JobResponse = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string().nullable().optional(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  companyId: z.string(),
});
export type JobResponse = z.infer<typeof JobResponse>;

