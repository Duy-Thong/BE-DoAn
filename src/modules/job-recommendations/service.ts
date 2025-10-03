import { PrismaClient } from '../../generated/prisma/index.js';
import { GetRecommendationsDto, UpdateRecommendationDto } from './dto.js';
import { aiClient } from '../../services/ai-client.js';

const prisma = new PrismaClient();

export class JobRecommendationService {
  // Tạo gợi ý việc làm cho user
  async generateRecommendations(userId: string, filters: GetRecommendationsDto) {
    // Lấy thông tin profile của user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        applications: {
          include: {
            job: true
          }
        },
        jobAlerts: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Lấy các job đã ứng tuyển để loại trừ
    const appliedJobIds = user.applications.map(app => app.jobId);

    // Lấy các job alerts để tìm kiếm
    const jobAlerts = user.jobAlerts;

    // Tạo query để tìm job phù hợp
    const where: any = {
      id: { notIn: appliedJobIds },
      isActive: true,
      isApproved: true
    };

    // Nếu có job alerts, sử dụng để filter
    if (jobAlerts.length > 0) {
      const alertConditions = jobAlerts.map(alert => {
        const conditions: any = {};
        
        if (alert.keywords) {
          conditions.OR = [
            { title: { contains: alert.keywords, mode: 'insensitive' } },
            { description: { contains: alert.keywords, mode: 'insensitive' } }
          ];
        }
        
        if (alert.location) {
          conditions.location = { contains: alert.location, mode: 'insensitive' };
        }
        
        if (alert.type) {
          conditions.type = alert.type;
        }
        
        return conditions;
      });

      where.OR = alertConditions;
    }

    // Lấy jobs và tính điểm
    const jobs = await prisma.job.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Tính điểm cho từng job
    const scoredJobs = jobs.map(job => {
      let score = 0.5; // Điểm cơ bản
      const reasons: string[] = [];

      // Điểm dựa trên profile
      if (user.profile) {
        // Kiểm tra skills match
        if (user.profile.skills && job.description) {
          const userSkills = user.profile.skills.toLowerCase().split(',').map(s => s.trim());
          const jobDescription = job.description.toLowerCase();
          
          const matchedSkills = userSkills.filter(skill => 
            jobDescription.includes(skill)
          );
          
          if (matchedSkills.length > 0) {
            score += 0.2 * (matchedSkills.length / userSkills.length);
            reasons.push(`Skills match: ${matchedSkills.join(', ')}`);
          }
        }

        // Kiểm tra location match
        if (user.profile.location && job.location) {
          if (user.profile.location.toLowerCase() === job.location.toLowerCase()) {
            score += 0.15;
            reasons.push('Location match');
          }
        }

        // Kiểm tra experience level
        if (user.profile.experience && job.requirements) {
          const experience = user.profile.experience.toLowerCase();
          const requirements = job.requirements.toLowerCase();
          
          if (experience.includes('senior') && requirements.includes('senior')) {
            score += 0.1;
            reasons.push('Experience level match');
          } else if (experience.includes('junior') && requirements.includes('junior')) {
            score += 0.1;
            reasons.push('Experience level match');
          }
        }
      }

      // Điểm dựa trên job alerts
      const matchingAlerts = jobAlerts.filter(alert => {
        let matches = true;
        
        if (alert.keywords) {
          const keywords = alert.keywords.toLowerCase();
          matches = matches && (
            job.title.toLowerCase().includes(keywords) ||
            job.description.toLowerCase().includes(keywords)
          );
        }
        
        if (alert.location) {
          matches = matches && job.location?.toLowerCase().includes(alert.location.toLowerCase());
        }
        
        if (alert.type) {
          matches = matches && job.type === alert.type;
        }
        
        return matches;
      });

      if (matchingAlerts.length > 0) {
        score += 0.2;
        reasons.push('Matches your job alerts');
      }

      // Điểm dựa trên company verification
      if (job.company.isVerified) {
        score += 0.05;
        reasons.push('Verified company');
      }

      // Điểm dựa trên popularity (views/applications ratio)
      const popularity = job._count.views > 0 ? 
        job._count.applications / job._count.views : 0;
      
      if (popularity > 0.1) {
        score += 0.05;
        reasons.push('Popular job');
      }

      // Đảm bảo score trong khoảng 0-1
      score = Math.min(1, Math.max(0, score));

      return {
        ...job,
        recommendationScore: score,
        recommendationReasons: reasons
      };
    });

    // Sắp xếp theo điểm giảm dần
    scoredJobs.sort((a, b) => b.recommendationScore - a.recommendationScore);

    // Lưu recommendations vào database
    const recommendations = await Promise.all(
      scoredJobs.slice(0, filters.limit).map(async (job) => {
        // Cập nhật hoặc tạo recommendation record
        const recommendation = await prisma.jobRecommendation.upsert({
          where: {
            userId_jobId: {
              userId,
              jobId: job.id
            }
          },
          update: {
            score: job.recommendationScore,
            reason: job.recommendationReasons.join('; ')
          },
          create: {
            userId,
            jobId: job.id,
            score: job.recommendationScore,
            reason: job.recommendationReasons.join('; ')
          }
        });

        return {
          ...job,
          recommendationId: recommendation.id
        };
      })
    );

    return {
      recommendations,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: scoredJobs.length,
        pages: Math.ceil(scoredJobs.length / filters.limit)
      }
    };
  }

  // Lấy danh sách gợi ý đã lưu
  async getSavedRecommendations(userId: string, filters: GetRecommendationsDto) {
    const [recommendations, total] = await Promise.all([
      prisma.jobRecommendation.findMany({
        where: { userId },
        include: {
          job: {
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
          }
        },
        orderBy: {
          score: 'desc'
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      prisma.jobRecommendation.count({
        where: { userId }
      })
    ]);

    return {
      recommendations: recommendations.map(rec => ({
        ...rec.job,
        recommendationScore: rec.score,
        recommendationReasons: rec.reason ? rec.reason.split('; ') : [],
        recommendationId: rec.id
      })),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit)
      }
    };
  }

  // Cập nhật điểm gợi ý (cho feedback)
  async updateRecommendation(userId: string, data: UpdateRecommendationDto) {
    const recommendation = await prisma.jobRecommendation.findFirst({
      where: {
        userId,
        jobId: data.jobId
      }
    });

    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    return await prisma.jobRecommendation.update({
      where: { id: recommendation.id },
      data: {
        score: data.score,
        reason: data.reason
      }
    });
  }

  // Xóa gợi ý
  async removeRecommendation(userId: string, jobId: string) {
    const recommendation = await prisma.jobRecommendation.findFirst({
      where: {
        userId,
        jobId
      }
    });

    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    return await prisma.jobRecommendation.delete({
      where: { id: recommendation.id }
    });
  }

  // Lấy gợi ý từ AI service
  async getAIRecommendations(userId: string, k: number = 5) {
    try {
      // Gọi AI service để lấy job IDs
      const aiResponse = await aiClient.getJobMatches(userId, k);
      
      if (!aiResponse || !aiResponse.jobIds || aiResponse.jobIds.length === 0) {
        return {
          recommendations: [],
          message: 'No recommendations found from AI service'
        };
      }

      // Lấy thông tin chi tiết của các jobs từ database
      const jobs = await prisma.job.findMany({
        where: {
          id: { in: aiResponse.jobIds },
          isActive: true,
          isApproved: true
        },
        include: {
          company: {
            select: {
              id: true,
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

      // Sắp xếp jobs theo thứ tự từ AI service
      const orderedJobs = aiResponse.jobIds
        .map(jobId => jobs.find(job => job.id === jobId))
        .filter((job): job is NonNullable<typeof job> => job !== undefined);

      // Lưu recommendations vào database để tracking
      await Promise.all(
        orderedJobs.map(async (job, index) => {
          const score = 1 - (index * 0.1); // Điểm giảm dần theo thứ tự
          
          await prisma.jobRecommendation.upsert({
            where: {
              userId_jobId: {
                userId,
                jobId: job.id
              }
            },
            update: {
              score,
              reason: 'AI-powered recommendation based on profile and preferences'
            },
            create: {
              userId,
              jobId: job.id,
              score,
              reason: 'AI-powered recommendation based on profile and preferences'
            }
          });
        })
      );

      return {
        recommendations: orderedJobs.map((job, index) => ({
          ...job,
          recommendationScore: 1 - (index * 0.1),
          recommendationReason: 'AI-powered recommendation',
          rank: index + 1
        })),
        total: orderedJobs.length,
        source: 'AI Service'
      };
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to get AI recommendations: ${error.message}` 
          : 'Failed to get AI recommendations'
      );
    }
  }
}
