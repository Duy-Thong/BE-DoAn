import { z } from 'zod';

export const CreateCompanyDto = z.object({
  name: z.string().min(1),
  website: z.string().url().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  logoUrl: z.string().url().optional(),
});
export type CreateCompanyDto = z.infer<typeof CreateCompanyDto>;

export const UpdateCompanyDto = CreateCompanyDto.partial();
export type UpdateCompanyDto = z.infer<typeof UpdateCompanyDto>;

export const CompanyResponse = z.object({
  id: z.string(),
  name: z.string(),
  website: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  isVerified: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type CompanyResponse = z.infer<typeof CompanyResponse>;

