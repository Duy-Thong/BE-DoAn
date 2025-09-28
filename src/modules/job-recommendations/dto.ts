import { z } from 'zod';

export const getRecommendationsDto = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
});

export const updateRecommendationDto = z.object({
  jobId: z.string().cuid('Invalid job ID'),
  score: z.number().min(0).max(1),
  reason: z.string().optional(),
});

export type GetRecommendationsDto = z.infer<typeof getRecommendationsDto>;
export type UpdateRecommendationDto = z.infer<typeof updateRecommendationDto>;
