import { z } from 'zod';

// AI Service DTOs
export const GenerateEmbeddingDto = z.object({
  text: z.string().min(1, 'Văn bản không được để trống'),
  type: z.enum(['CV', 'JOB'], {
    errorMap: () => ({ message: 'Loại embedding phải là CV hoặc JOB' })
  }),
});

export const JobRecommendationDto = z.object({
  cvId: z.string().cuid('ID CV không hợp lệ'),
  limit: z.number().int().min(1).max(50).default(10),
  filters: z.object({
    location: z.string().optional(),
    type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional(),
    remoteWork: z.boolean().optional(),
    salary: z.string().optional(),
  }).optional(),
});

export const EmbeddingResponse = z.object({
  embedding: z.array(z.number()),
  model: z.string(),
  tokens: z.number(),
});

export const JobRecommendationResponse = z.object({
  jobId: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string().nullable(),
  type: z.string(),
  salary: z.string().nullable(),
  remoteWork: z.boolean(),
  matchScore: z.number(),
  reason: z.string(),
});

export type GenerateEmbeddingDto = z.infer<typeof GenerateEmbeddingDto>;
export type JobRecommendationDto = z.infer<typeof JobRecommendationDto>;
export type EmbeddingResponse = z.infer<typeof EmbeddingResponse>;
export type JobRecommendationResponse = z.infer<typeof JobRecommendationResponse>;
