import { z } from 'zod';

export const CreateJobAlertDto = z.object({ 
  keywords: z.string().optional(), 
  location: z.string().optional(), 
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional(),
  isActive: z.boolean().default(true)
});
export type CreateJobAlertDto = z.infer<typeof CreateJobAlertDto>;

export const UpdateJobAlertDto = CreateJobAlertDto.partial();
export type UpdateJobAlertDto = z.infer<typeof UpdateJobAlertDto>;

export const JobAlertResponse = z.object({
  id: z.string(),
  keywords: z.string().nullable(),
  location: z.string().nullable(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
});
export type JobAlertResponse = z.infer<typeof JobAlertResponse>;
