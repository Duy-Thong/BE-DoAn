import { z } from 'zod';

export const CreateApplicationDto = z.object({
  jobId: z.string(),
  cvUrl: z.string().url().optional(),
  coverLetter: z.string().optional(),
});
export type CreateApplicationDto = z.infer<typeof CreateApplicationDto>;

export const ApplicationResponse = z.object({
  id: z.string(),
  status: z.enum(['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFER', 'REJECTED']),
  userId: z.string(),
  jobId: z.string(),
  cvUrl: z.string().nullable().optional(),
  coverLetter: z.string().nullable().optional(),
});
export type ApplicationResponse = z.infer<typeof ApplicationResponse>;

