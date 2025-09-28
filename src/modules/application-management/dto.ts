import { z } from 'zod';

export const createApplicationDto = z.object({
  jobId: z.string().cuid('Invalid job ID'),
  cvId: z.string().cuid('Invalid CV ID').optional(),
  coverLetter: z.string().optional(),
});

export const updateApplicationStatusDto = z.object({
  applicationId: z.string().cuid('Invalid application ID'),
  status: z.enum(['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFER', 'REJECTED']),
});

export const addInternalNoteDto = z.object({
  applicationId: z.string().cuid('Invalid application ID'),
  content: z.string().min(1, 'Note content is required'),
  isPrivate: z.boolean().default(true),
});

export const getApplicationsDto = z.object({
  jobId: z.string().cuid('Invalid job ID').optional(),
  status: z.enum(['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFER', 'REJECTED']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export type CreateApplicationDto = z.infer<typeof createApplicationDto>;
export type UpdateApplicationStatusDto = z.infer<typeof updateApplicationStatusDto>;
export type AddInternalNoteDto = z.infer<typeof addInternalNoteDto>;
export type GetApplicationsDto = z.infer<typeof getApplicationsDto>;
