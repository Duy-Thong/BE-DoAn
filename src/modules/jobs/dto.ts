import { z } from 'zod';
import { createJobRequirementDto } from './requirements/dto.js';
import { createJobBenefitDto } from './benefits/dto.js';
import { createJobSkillDto } from './skills/dto.js';

export const CreateJobDto = z.object({
  title: z.string().min(1, 'Tiêu đề công việc không được để trống'),
  description: z.string().min(1, 'Mô tả công việc không được để trống'),
  location: z.string().optional(),
  industry: z.string().optional(),
  experienceLevel: z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD']).optional(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).default('FULL_TIME'),
  salary: z.number().optional(),
  urgent: z.boolean().default(false),
  expiresAt: z.string().datetime().optional(),
  companyId: z.string().cuid('ID công ty không hợp lệ'),
  // Nested data
  requirements: z.array(createJobRequirementDto).optional(),
  benefits: z.array(createJobBenefitDto).optional(),
  skills: z.array(createJobSkillDto).optional(),
});
export type CreateJobDto = z.infer<typeof CreateJobDto>;

export const UpdateJobDto = CreateJobDto.partial().omit({
  companyId: true, // Không cho phép thay đổi companyId khi update
}).extend({
  isActive: z.boolean().optional(),
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
  industry: z.string().nullable(),
  experienceLevel: z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD']).nullable(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  salary: z.number().nullable(),
  urgent: z.boolean(),
  isActive: z.boolean(),
  expiresAt: z.date().nullable(),
  applicationCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  companyId: z.string(),
});
export type JobResponse = z.infer<typeof JobResponse>;

// Query/Filter DTO for listing jobs
export const JobQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
  experienceLevel: z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD']).optional(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'urgent', 'applicationCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  userId: z.string().optional(), // Optional: user ID for AI recommendations
});
export type JobQueryDto = z.infer<typeof JobQueryDto>;

// Re-export types for convenience
export type { CreateJobRequirementDto, UpdateJobRequirementDto } from './requirements/dto.js';
export type { CreateJobBenefitDto, UpdateJobBenefitDto } from './benefits/dto.js';
export type { CreateJobSkillDto, UpdateJobSkillDto } from './skills/dto.js';

