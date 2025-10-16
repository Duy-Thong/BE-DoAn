import { z } from 'zod';

export const createJobViewDto = z.object({
  userId: z.string().cuid('User ID không hợp lệ'),
  jobId: z.string().cuid('Job ID không hợp lệ'),
  viewedAt: z.string().datetime().optional(),
});
export type CreateJobViewDto = z.infer<typeof createJobViewDto>;

export const updateJobViewDto = createJobViewDto.partial();
export type UpdateJobViewDto = z.infer<typeof updateJobViewDto>;
