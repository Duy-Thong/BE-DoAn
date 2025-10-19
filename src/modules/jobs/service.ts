import { prisma } from '../../loaders/prisma.js';
import type { CreateJobDto, UpdateJobDto, RepostJobDto } from './dto.js';

export class JobsService {
  async list() {
    return prisma.job.findMany({ 
      where: { 
        isActive: true
      }, 
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
            isVerified: true
          }
        },
        requirements: true,
        benefits: true,
        jobSkills: true,
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: [
        { urgent: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async create(input: CreateJobDto) {
    const data: any = {
      title: input.title,
      description: input.description,
      location: input.location ?? null,
      industry: input.industry ?? null,
      experienceLevel: input.experienceLevel ?? null,
      type: (input.type as any) || 'FULL_TIME',
      salary: input.salary ?? null,
      urgent: input.urgent ?? false,
      companyId: input.companyId,
      isActive: true, // Theo schema hiện tại, job active ngay
      embedding: [], // TODO: Generate embedding using AI service
    };

    if (input.expiresAt) {
      data.expiresAt = new Date(input.expiresAt);
    }

    // Add nested data creation
    if (input.requirements && input.requirements.length > 0) {
      data.requirements = {
        create: input.requirements.map(req => ({
          title: req.title,
          description: req.description
        }))
      };
    }

    if (input.benefits && input.benefits.length > 0) {
      data.benefits = {
        create: input.benefits.map(benefit => ({
          title: benefit.title,
          description: benefit.description
        }))
      };
    }

    if (input.skills && input.skills.length > 0) {
      data.jobSkills = {
        create: input.skills.map(skill => ({
          skillName: skill.skillName,
          isRequired: skill.isRequired
        }))
      };
    }

    return prisma.job.create({ 
      data,
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
            isVerified: true
          }
        },
        requirements: true,
        benefits: true,
        jobSkills: true
      }
    });
  }

  async getById(id: string) {
    return prisma.job.findUnique({ 
      where: { id },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
            isVerified: true,
            description: true,
            website: true,
            address: true
          }
        },
        requirements: true,
        benefits: true,
        jobSkills: true,
        _count: {
          select: {
            applications: true
          }
        }
      }
    });
  }

  async update(id: string, input: UpdateJobDto) {
    const data: any = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.location !== undefined) data.location = input.location ?? null;
    if (input.industry !== undefined) data.industry = input.industry ?? null;
    if (input.experienceLevel !== undefined) data.experienceLevel = input.experienceLevel;
    if (input.type !== undefined) data.type = input.type as any;
    if (input.salary !== undefined) data.salary = input.salary ?? null;
    if (input.urgent !== undefined) data.urgent = input.urgent;
    if (input.expiresAt !== undefined) data.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    if (input.isActive !== undefined) data.isActive = input.isActive;

    return prisma.job.update({ 
      where: { id }, 
      data,
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
            isVerified: true
          }
        }
      }
    });
  }

  async remove(id: string) {
    // Xóa các nested relationships trước
    await prisma.$transaction(async (tx) => {
      // Xóa applications
      await tx.application.deleteMany({
        where: { jobId: id }
      });

      // Xóa saved jobs
      await tx.savedJob.deleteMany({
        where: { jobId: id }
      });

      // Xóa job requirements
      await tx.jobRequirement.deleteMany({
        where: { jobId: id }
      });

      // Xóa job benefits
      await tx.jobBenefit.deleteMany({
        where: { jobId: id }
      });

      // Xóa job skills
      await tx.jobSkill.deleteMany({
        where: { jobId: id }
      });

      // Cuối cùng xóa job
      await tx.job.delete({
        where: { id }
      });
    });
  }

  // Tái đăng tin tuyển dụng
  async repostJob(companyId: string, userId: string, input: RepostJobDto) {
    // Kiểm tra quyền truy cập
    const hasPermission = await this.checkJobPermission(companyId, userId);
    if (!hasPermission) {
      throw new Error('Insufficient permissions to repost job');
    }

    // Kiểm tra job thuộc về công ty
    const job = await prisma.job.findFirst({
      where: {
        id: input.jobId,
        companyId
      }
    });

    if (!job) {
      throw new Error('Job not found or access denied');
    }

    const data: any = {
      isActive: true // Tái đăng job
    };

    if (input.expiresAt) {
      data.expiresAt = new Date(input.expiresAt);
    }

    return prisma.job.update({
      where: { id: input.jobId },
      data,
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
            isVerified: true
          }
        }
      }
    });
  }

  // Lấy danh sách jobs của công ty
  async getCompanyJobs(companyId: string, userId: string) {
    // Kiểm tra quyền truy cập
    const hasPermission = await this.checkJobPermission(companyId, userId);
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    return prisma.job.findMany({
      where: { companyId },
      include: {
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Kiểm tra quyền truy cập job
  private async checkJobPermission(companyId: string, userId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
        companyRole: { in: ['OWNER', 'MANAGER', 'RECRUITER'] }
      }
    });

    return !!user;
  }

  // Track job view - simplified version
  async trackJobView(jobId: string) {
    // Increment application count as view tracking
    return await prisma.job.update({
      where: { id: jobId },
      data: {
        applicationCount: {
          increment: 1
        }
      }
    });
  }

  // Generate job embedding (for AI recommendations)
  async generateEmbedding(jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new Error('Job không tìm thấy');
    }

    // TODO: Call AI service to generate embedding
    // For now, return empty array
    const embedding: number[] = [];
    
    return await prisma.job.update({
      where: { id: jobId },
      data: { embedding }
    });
  }

  // Get job with all related data
  async getJobWithDetails(jobId: string) {
    return await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
            isVerified: true,
            description: true,
            website: true,
            address: true
          }
        },
        requirements: true,
        benefits: true,
        jobSkills: true,
        _count: {
          select: {
            applications: true
          }
        }
      }
    });
  }
}

