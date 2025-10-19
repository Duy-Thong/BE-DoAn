import { z } from 'zod';

// Đúng theo schema: AppStatus có 3 giá trị PENDING, ACCEPTED, REJECTED
export const AppStatusEnum = z.enum(['PENDING', 'ACCEPTED', 'REJECTED']);

export const CreateApplicationDto = z.object({
  jobId: z.string().cuid('ID công việc không hợp lệ'),
  cvId: z.string().cuid('ID CV không hợp lệ'),
  coverLetter: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateApplicationDto = z.infer<typeof CreateApplicationDto>;

export const UpdateApplicationDto = z.object({
  cvId: z.string().cuid('ID CV không hợp lệ').optional(),
  coverLetter: z.string().optional(),
  notes: z.string().optional(),
});
export type UpdateApplicationDto = z.infer<typeof UpdateApplicationDto>;

export const UpdateApplicationStatusDto = z.object({
  status: AppStatusEnum,
  notes: z.string().optional(),
});
export type UpdateApplicationStatusDto = z.infer<typeof UpdateApplicationStatusDto>;

export const ApplicationResponse = z.object({
  id: z.string(),
  status: AppStatusEnum,
  cvId: z.string(),
  jobId: z.string(),
  coverLetter: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  cv: z.object({
    id: z.string(),
    title: z.string(),
    fullName: z.string(),
    userId: z.string(),
  }).optional(),
  job: z.object({
    id: z.string(),
    title: z.string(),
    company: z.object({
      name: z.string(),
    }),
  }).optional(),
});
export type ApplicationResponse = z.infer<typeof ApplicationResponse>;

