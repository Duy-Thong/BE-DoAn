import { z } from 'zod';

export const CreateApplicationDto = z.object({
  jobId: z.string().cuid('ID công việc không hợp lệ'),
  cvId: z.string().cuid('ID CV không hợp lệ').optional(),
  coverLetter: z.string().optional(),
  availableFrom: z.string().datetime().optional(),
  notes: z.string().optional(),
});
export type CreateApplicationDto = z.infer<typeof CreateApplicationDto>;

export const UpdateApplicationDto = z.object({
  cvId: z.string().cuid('ID CV không hợp lệ').optional(),
  coverLetter: z.string().optional(),
  availableFrom: z.string().datetime().optional(),
  notes: z.string().optional(),
  status: z.enum(['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFER', 'REJECTED']).optional(),
});
export type UpdateApplicationDto = z.infer<typeof UpdateApplicationDto>;

export const ApplicationResponse = z.object({
  id: z.string(),
  status: z.enum(['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFER', 'REJECTED']),
  cvId: z.string().nullable(),
  coverLetter: z.string().nullable(),
  appliedAt: z.date(),
  availableFrom: z.date().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  jobId: z.string(),
  cv: z.object({
    id: z.string(),
    title: z.string(),
    fullName: z.string(),
  }).nullable().optional(),
  job: z.object({
    id: z.string(),
    title: z.string(),
    company: z.object({
      name: z.string(),
    }),
  }).optional(),
});
export type ApplicationResponse = z.infer<typeof ApplicationResponse>;

export const UpdateApplicationStatusDto = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFER', 'REJECTED']),
  notes: z.string().optional(),
});
export type UpdateApplicationStatusDto = z.infer<typeof UpdateApplicationStatusDto>;

