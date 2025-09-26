import { z } from 'zod';

export const CreateCompanyDto = z.object({
  name: z.string().min(1),
  website: z.string().url().optional(),
  description: z.string().optional(),
});
export type CreateCompanyDto = z.infer<typeof CreateCompanyDto>;

export const UpdateCompanyDto = CreateCompanyDto.partial();
export type UpdateCompanyDto = z.infer<typeof UpdateCompanyDto>;

export const CompanyResponse = z.object({
  id: z.string(),
  name: z.string(),
  website: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});
export type CompanyResponse = z.infer<typeof CompanyResponse>;

