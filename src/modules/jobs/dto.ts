import { z } from 'zod';

export const CreateJobDto = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().optional(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional(),
  salary: z.string().optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  companyId: z.string(),
});
export type CreateJobDto = z.infer<typeof CreateJobDto>;

export const UpdateJobDto = CreateJobDto.partial();
export type UpdateJobDto = z.infer<typeof UpdateJobDto>;

export const RepostJobDto = z.object({
  jobId: z.string().cuid('Invalid job ID'),
  expiresAt: z.string().datetime().optional(),
});
export type RepostJobDto = z.infer<typeof RepostJobDto>;

export const JobResponse = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string().nullable().optional(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  salary: z.string().nullable().optional(),
  requirements: z.string().nullable().optional(),
  benefits: z.string().nullable().optional(),
  isActive: z.boolean(),
  isApproved: z.boolean(),
  isReposted: z.boolean(),
  repostedAt: z.date().nullable().optional(),
  expiresAt: z.date().nullable().optional(),
  companyId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type JobResponse = z.infer<typeof JobResponse>;

