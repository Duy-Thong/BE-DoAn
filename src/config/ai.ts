import { z } from 'zod';

const AIConfigSchema = z.object({
  AI_SERVICE_URL: z.string().url().default('http://127.0.0.1:8000'),
  AI_SERVICE_TIMEOUT: z.coerce.number().default(30000), // 30 seconds
  AI_SERVICE_RETRY_ATTEMPTS: z.coerce.number().default(3),
  AI_EMBEDDING_MODEL: z.string().default('text-embedding-ada-002'),
  AI_RECOMMENDATION_MODEL: z.string().default('gpt-3.5-turbo'),
  AI_ANALYSIS_MODEL: z.string().default('gpt-4'),
  AI_BATCH_SIZE: z.coerce.number().default(10),
  AI_CACHE_TTL: z.coerce.number().default(3600), // 1 hour
});

export type AIConfig = z.infer<typeof AIConfigSchema>;

export const aiConfig: AIConfig = AIConfigSchema.parse(process.env);

// AI Service API endpoints
export const AI_ENDPOINTS = {
  HEALTH: '/health',
  EMBEDDINGS: {
    GENERATE: '/api/embeddings/generate',
    BATCH: '/api/embeddings/batch',
    SEARCH: '/api/embeddings/search'
  },
  RECOMMENDATIONS: {
    JOBS: '/api/recommendations/jobs',
    CANDIDATES: '/api/recommendations/candidates',
    SKILLS: '/api/recommendations/skills'
  },
  ANALYSIS: {
    CV: '/api/analyze/cv',
    JOB: '/api/analyze/job',
    MATCH: '/api/analyze/match'
  },
  JOBS: {
    MATCH: '/api/jobs/match'
  }
} as const;

// AI Service client configuration
export const AI_CLIENT_CONFIG = {
  baseURL: aiConfig.AI_SERVICE_URL,
  timeout: aiConfig.AI_SERVICE_TIMEOUT,
  retryAttempts: aiConfig.AI_SERVICE_RETRY_ATTEMPTS,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'BE-DoAn-API/1.0.0'
  }
} as const;
