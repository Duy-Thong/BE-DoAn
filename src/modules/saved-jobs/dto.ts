import { z } from 'zod';

export const createSavedJobDto = z.object({
  jobId: z.string().cuid('Job ID không hợp lệ'),
});
export type CreateSavedJobDto = z.infer<typeof createSavedJobDto>;

export const updateSavedJobDto = createSavedJobDto.partial();
export type UpdateSavedJobDto = z.infer<typeof updateSavedJobDto>;
