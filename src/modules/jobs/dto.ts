import { z } from 'zod';

export const CreateJobDto = z.object({
  title: z.string().min(1, 'Tiêu đề công việc không được để trống'),
  description: z.string().min(1, 'Mô tả công việc không được để trống'),
  location: z.string().optional(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).default('FULL_TIME'),
  salary: z.string().optional(),
  remoteWork: z.boolean().default(false),
  urgent: z.boolean().default(false),
  featured: z.boolean().default(false),
  expiresAt: z.string().datetime().optional(),
  companyId: z.string().cuid('ID công ty không hợp lệ'),
});
export type CreateJobDto = z.infer<typeof CreateJobDto>;

export const UpdateJobDto = CreateJobDto.partial().extend({
  isActive: z.boolean().optional(),
  isApproved: z.boolean().optional(),
});
export type UpdateJobDto = z.infer<typeof UpdateJobDto>;

export const RepostJobDto = z.object({
  jobId: z.string().cuid('ID công việc không hợp lệ'),
  expiresAt: z.string().datetime().optional(),
});
export type RepostJobDto = z.infer<typeof RepostJobDto>;

export const JobResponse = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  salary: z.string().nullable(),
  remoteWork: z.boolean(),
  urgent: z.boolean(),
  featured: z.boolean(),
  isActive: z.boolean(),
  isApproved: z.boolean(),
  expiresAt: z.date().nullable(),
  viewCount: z.number(),
  applicationCount: z.number(),
  companyId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type JobResponse = z.infer<typeof JobResponse>;

// Job Requirements DTOs
export const CreateJobRequirementDto = z.object({
  title: z.string().min(1, 'Tiêu đề yêu cầu không được để trống'),
  description: z.string().optional(),
});
export type CreateJobRequirementDto = z.infer<typeof CreateJobRequirementDto>;

export const UpdateJobRequirementDto = CreateJobRequirementDto.partial();
export type UpdateJobRequirementDto = z.infer<typeof UpdateJobRequirementDto>;

// Job Benefits DTOs
export const CreateJobBenefitDto = z.object({
  title: z.string().min(1, 'Tiêu đề phúc lợi không được để trống'),
  description: z.string().optional(),
});
export type CreateJobBenefitDto = z.infer<typeof CreateJobBenefitDto>;

export const UpdateJobBenefitDto = CreateJobBenefitDto.partial();
export type UpdateJobBenefitDto = z.infer<typeof UpdateJobBenefitDto>;

// Job Skills DTOs
export const CreateJobSkillDto = z.object({
  skillName: z.string().min(1, 'Tên kỹ năng không được để trống'),
  isRequired: z.boolean().default(true),
});
export type CreateJobSkillDto = z.infer<typeof CreateJobSkillDto>;

export const UpdateJobSkillDto = CreateJobSkillDto.partial();
export type UpdateJobSkillDto = z.infer<typeof UpdateJobSkillDto>;

