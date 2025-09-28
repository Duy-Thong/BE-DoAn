import { aiConfig, AI_CLIENT_CONFIG, AI_ENDPOINTS } from '../config/ai.js';

export interface EmbeddingRequest {
  content: string;
  type: 'CV' | 'JOB_DESCRIPTION' | 'PROFILE' | 'COMPANY';
  metadata?: Record<string, any>;
}

export interface EmbeddingResponse {
  id: string;
  content: string;
  type: string;
  embedding: number[];
  metadata: Record<string, any>;
  createdAt: string;
}

export interface RecommendationRequest {
  userId?: string;
  jobId?: string;
  type: 'JOB_RECOMMENDATION' | 'CANDIDATE_RECOMMENDATION' | 'SKILL_MATCH';
  filters?: Record<string, any>;
}

export interface RecommendationResponse {
  id: string;
  score: number;
  reasons: string[];
  data: any;
}

export interface AnalysisRequest {
  content: string;
  type: 'CV' | 'JOB_DESCRIPTION';
  metadata?: Record<string, any>;
}

export interface AnalysisResponse {
  skills: string[];
  experience?: string;
  education?: string;
  languages?: string[];
  certifications?: string[];
  summary: string;
  confidence: number;
}

class AIServiceClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseURL = AI_CLIENT_CONFIG.baseURL;
    this.timeout = AI_CLIENT_CONFIG.timeout;
    this.retryAttempts = AI_CLIENT_CONFIG.retryAttempts;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...AI_CLIENT_CONFIG.headers,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI Service error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async retryRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await this.makeRequest<T>(endpoint, options);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.retryAttempts) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; version: string }> {
    return this.makeRequest(AI_ENDPOINTS.HEALTH);
  }

  // Generate embedding
  async generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    return this.retryRequest(AI_ENDPOINTS.EMBEDDINGS.GENERATE, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Batch generate embeddings
  async generateEmbeddingsBatch(requests: EmbeddingRequest[]): Promise<EmbeddingResponse[]> {
    return this.retryRequest(AI_ENDPOINTS.EMBEDDINGS.BATCH, {
      method: 'POST',
      body: JSON.stringify({ items: requests }),
    });
  }

  // Search similar embeddings
  async searchEmbeddings(
    query: string,
    type: string,
    limit: number = 10
  ): Promise<EmbeddingResponse[]> {
    return this.retryRequest(`${AI_ENDPOINTS.EMBEDDINGS.SEARCH}?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
  }

  // Generate job recommendations
  async generateJobRecommendations(request: RecommendationRequest): Promise<RecommendationResponse[]> {
    return this.retryRequest(AI_ENDPOINTS.RECOMMENDATIONS.JOBS, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Generate candidate recommendations
  async generateCandidateRecommendations(request: RecommendationRequest): Promise<RecommendationResponse[]> {
    return this.retryRequest(AI_ENDPOINTS.RECOMMENDATIONS.CANDIDATES, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Generate skill recommendations
  async generateSkillRecommendations(request: RecommendationRequest): Promise<RecommendationResponse[]> {
    return this.retryRequest(AI_ENDPOINTS.RECOMMENDATIONS.SKILLS, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Analyze CV
  async analyzeCV(request: AnalysisRequest): Promise<AnalysisResponse> {
    return this.retryRequest(AI_ENDPOINTS.ANALYSIS.CV, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Analyze job description
  async analyzeJob(request: AnalysisRequest): Promise<AnalysisResponse> {
    return this.retryRequest(AI_ENDPOINTS.ANALYSIS.JOB, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Analyze match between CV and job
  async analyzeMatch(cvContent: string, jobContent: string): Promise<{
    matchScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  }> {
    return this.retryRequest(AI_ENDPOINTS.ANALYSIS.MATCH, {
      method: 'POST',
      body: JSON.stringify({ cvContent, jobContent }),
    });
  }
}

export const aiClient = new AIServiceClient();
