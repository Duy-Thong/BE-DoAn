import { z } from 'zod';

export const getCompanyInfoDto = z.object({
  companyId: z.string().cuid('Invalid company ID'),
});

export const getCompanyJobsDto = z.object({
  companyId: z.string().cuid('Invalid company ID'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional(),
});

export type GetCompanyInfoDto = z.infer<typeof getCompanyInfoDto>;
export type GetCompanyJobsDto = z.infer<typeof getCompanyJobsDto>;
