import { prisma } from '../../../loaders/prisma.js';
import { AIService } from '../service.js';

export class RecommendationService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  // Get job recommendations for a user based on their CV
  async getJobRecommendations(userId: string, cvId: string, limit: number = 10) {
    // Kiểm tra CV thuộc về user
    const cv = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId
      }
    });

    if (!cv) {
      throw new Error('CV không tìm thấy hoặc không có quyền truy cập');
    }

    if (!cv.embedding || cv.embedding.length === 0) {
      throw new Error('CV chưa có embedding. Vui lòng tạo embedding trước.');
    }

    // Lấy danh sách jobs có embedding
    const jobs = await prisma.job.findMany({
      where: {
        isActive: true,
        isApproved: true,
        embedding: {
          not: null
        }
      },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
            isVerified: true
          }
        },
        _count: {
          select: {
            applications: true,
            views: true
          }
        }
      }
    });

    if (jobs.length === 0) {
      return [];
    }

    // Tính toán similarity scores
    const jobsWithScores = jobs.map(job => {
      const similarity = this.calculateCosineSimilarity(cv.embedding, job.embedding);
      return {
        ...job,
        similarityScore: similarity
      };
    });

    // Sắp xếp theo similarity score và lấy top results
    const recommendedJobs = jobsWithScores
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit)
      .map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        type: job.type,
        salary: job.salary,
        remoteWork: job.remoteWork,
        urgent: job.urgent,
        featured: job.featured,
        viewCount: job.viewCount,
        applicationCount: job.applicationCount,
        createdAt: job.createdAt,
        company: job.company,
        similarityScore: job.similarityScore,
        _count: job._count
      }));

    return recommendedJobs;
  }

  // Get job recommendations using AI microservice
  async getAIJobRecommendations(userId: string, cvId: string, limit: number = 10) {
    // Kiểm tra CV thuộc về user
    const cv = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId
      }
    });

    if (!cv) {
      throw new Error('CV không tìm thấy hoặc không có quyền truy cập');
    }

    if (!cv.embedding || cv.embedding.length === 0) {
      throw new Error('CV chưa có embedding. Vui lòng tạo embedding trước.');
    }

    try {
      // Gọi AI microservice để lấy recommendations
      const recommendations = await this.aiService.recommendJobs(userId, {
        cvId,
        limit
      });

      // Lấy thông tin chi tiết của các jobs được recommend
      const jobs = await prisma.job.findMany({
        where: {
          id: { in: recommendations.jobIds },
          isActive: true,
          isApproved: true
        },
        include: {
          company: {
            select: {
              name: true,
              logoUrl: true,
              isVerified: true
            }
          },
          _count: {
            select: {
              applications: true,
              views: true
            }
          }
        }
      });

      return jobs;
    } catch (error) {
      console.error('AI recommendation failed, falling back to local similarity:', error);
      // Fallback to local similarity calculation
      return this.getJobRecommendations(userId, cvId, limit);
    }
  }

  // Get similar CVs for a job (for recruiters)
  async getSimilarCVs(jobId: string, userId: string, limit: number = 10) {
    // Kiểm tra quyền truy cập job
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        company: {
          members: {
            some: {
              userId,
              role: { in: ['OWNER', 'MANAGER', 'RECRUITER'] }
            }
          }
        }
      }
    });

    if (!job) {
      throw new Error('Job không tìm thấy hoặc không có quyền truy cập');
    }

    if (!job.embedding || job.embedding.length === 0) {
      throw new Error('Job chưa có embedding. Vui lòng tạo embedding trước.');
    }

    // Lấy danh sách CVs có embedding
    const cvs = await prisma.cV.findMany({
      where: {
        embedding: {
          not: null
        },
        isMain: true // Chỉ lấy CV chính của users
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    if (cvs.length === 0) {
      return [];
    }

    // Tính toán similarity scores
    const cvsWithScores = cvs.map(cv => {
      const similarity = this.calculateCosineSimilarity(job.embedding, cv.embedding);
      return {
        ...cv,
        similarityScore: similarity
      };
    });

    // Sắp xếp theo similarity score và lấy top results
    const similarCVs = cvsWithScores
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit)
      .map(cv => ({
        id: cv.id,
        title: cv.title,
        fullName: cv.fullName,
        currentPosition: cv.currentPosition,
        summary: cv.summary,
        createdAt: cv.createdAt,
        user: cv.user,
        similarityScore: cv.similarityScore
      }));

    return similarCVs;
  }

  // Get trending jobs based on views and applications
  async getTrendingJobs(limit: number = 10) {
    const trendingJobs = await prisma.job.findMany({
      where: {
        isActive: true,
        isApproved: true
      },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
            isVerified: true
          }
        },
        _count: {
          select: {
            applications: true,
            views: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { urgent: 'desc' },
        { viewCount: 'desc' },
        { applicationCount: 'desc' }
      ],
      take: limit
    });

    return trendingJobs;
  }

  // Get personalized job recommendations based on user's application history
  async getPersonalizedRecommendations(userId: string, limit: number = 10) {
    // Lấy lịch sử ứng tuyển của user
    const applicationHistory = await prisma.application.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: true,
            jobSkills: true
          }
        }
      },
      orderBy: { appliedAt: 'desc' },
      take: 20 // Lấy 20 ứng tuyển gần nhất
    });

    if (applicationHistory.length === 0) {
      // Nếu chưa có lịch sử ứng tuyển, trả về trending jobs
      return this.getTrendingJobs(limit);
    }

    // Phân tích pattern từ lịch sử ứng tuyển
    const preferredJobTypes = this.analyzeJobPreferences(applicationHistory);
    const preferredCompanies = this.analyzeCompanyPreferences(applicationHistory);
    const preferredSkills = this.analyzeSkillPreferences(applicationHistory);

    // Tìm jobs phù hợp với preferences
    const recommendedJobs = await prisma.job.findMany({
      where: {
        isActive: true,
        isApproved: true,
        OR: [
          { type: { in: preferredJobTypes } },
          { companyId: { in: preferredCompanies } },
          { jobSkills: { some: { skillName: { in: preferredSkills } } } }
        ]
      },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
            isVerified: true
          }
        },
        jobSkills: true,
        _count: {
          select: {
            applications: true,
            views: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { urgent: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    return recommendedJobs;
  }

  // Calculate cosine similarity between two vectors
  private calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  // Analyze job type preferences from application history
  private analyzeJobPreferences(applications: any[]): string[] {
    const typeCount: Record<string, number> = {};
    
    applications.forEach(app => {
      const type = app.job.type;
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    // Trả về top 3 job types được ưa chuộng
    return Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
  }

  // Analyze company preferences from application history
  private analyzeCompanyPreferences(applications: any[]): string[] {
    const companyCount: Record<string, number> = {};
    
    applications.forEach(app => {
      const companyId = app.job.companyId;
      companyCount[companyId] = (companyCount[companyId] || 0) + 1;
    });

    // Trả về top 5 companies được ưa chuộng
    return Object.entries(companyCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([companyId]) => companyId);
  }

  // Analyze skill preferences from application history
  private analyzeSkillPreferences(applications: any[]): string[] {
    const skillCount: Record<string, number> = {};
    
    applications.forEach(app => {
      app.job.jobSkills.forEach((skill: any) => {
        skillCount[skill.skillName] = (skillCount[skill.skillName] || 0) + 1;
      });
    });

    // Trả về top 10 skills được ưa chuộng
    return Object.entries(skillCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skillName]) => skillName);
  }
}
