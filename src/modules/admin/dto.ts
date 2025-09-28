import { z } from 'zod';

export const getUsersDto = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  role: z.enum(['ADMIN', 'RECRUITER', 'CANDIDATE']).optional(),
  isActive: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  search: z.string().optional(),
});

export const updateUserStatusDto = z.object({
  userId: z.string().cuid('Invalid user ID'),
  isActive: z.boolean().optional(),
  isLocked: z.boolean().optional(),
});

export const deleteUserDto = z.object({
  userId: z.string().cuid('Invalid user ID'),
});

export const getJobsDto = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  isApproved: z.boolean().optional(),
  companyId: z.string().cuid('Invalid company ID').optional(),
  search: z.string().optional(),
});

export const approveJobDto = z.object({
  jobId: z.string().cuid('Invalid job ID'),
  isApproved: z.boolean(),
  reason: z.string().optional(),
});

export const getCompaniesDto = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

export const verifyCompanyDto = z.object({
  companyId: z.string().cuid('Invalid company ID'),
  isVerified: z.boolean(),
  reason: z.string().optional(),
});

export type GetUsersDto = z.infer<typeof getUsersDto>;
export type UpdateUserStatusDto = z.infer<typeof updateUserStatusDto>;
export type DeleteUserDto = z.infer<typeof deleteUserDto>;
export type GetJobsDto = z.infer<typeof getJobsDto>;
export type ApproveJobDto = z.infer<typeof approveJobDto>;
export type GetCompaniesDto = z.infer<typeof getCompaniesDto>;
export type VerifyCompanyDto = z.infer<typeof verifyCompanyDto>;
