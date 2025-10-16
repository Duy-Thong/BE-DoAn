import { prisma } from '../../loaders/prisma.js';
import type { CreateJobDto, UpdateJobDto, RepostJobDto } from './dto.js';

export class JobsService {
  async list() {
    return prisma.job.findMany({ 
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
        { createdAt: 'desc' }
      ]
    });
  }

  async create(input: CreateJobDto) {
    const data: any = {
      title: input.title,
      description: input.description,
      location: input.location ?? null,
      type: (input.type as any) || 'FULL_TIME',
      salary: input.salary ?? null,
      remoteWork: input.remoteWork,
      urgent: input.urgent,
      featured: input.featured,
      companyId: input.companyId,
      isActive: false, // Cần được duyệt trước khi active
      isApproved: false,
      embedding: [], // TODO: Generate embedding using AI service
    };

    if (input.expiresAt) {
      data.expiresAt = new Date(input.expiresAt);
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
        }
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
        _count: {
          select: {
            applications: true,
            views: true
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
    if (input.type !== undefined) data.type = input.type as any;
    if (input.salary !== undefined) data.salary = input.salary ?? null;
    if (input.remoteWork !== undefined) data.remoteWork = input.remoteWork;
    if (input.urgent !== undefined) data.urgent = input.urgent;
    if (input.featured !== undefined) data.featured = input.featured;
    if (input.expiresAt !== undefined) data.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.isApproved !== undefined) data.isApproved = input.isApproved;
    
    // Khi update, cần duyệt lại (trừ khi admin cập nhật)
    if (input.isApproved === undefined) {
      data.isApproved = false;
      data.isActive = false;
    }

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
    await prisma.job.delete({ where: { id } });
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
      isApproved: false, // Cần duyệt lại khi tái đăng
      isActive: false
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
            applications: true,
            views: true
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
    const member = await prisma.companyMember.findFirst({
      where: {
        userId,
        companyId,
        role: { in: ['OWNER', 'MANAGER', 'RECRUITER'] }
      }
    });

    return !!member;
  }

  // Track job view
  async trackJobView(jobId: string) {
    // Increment view count
    await prisma.job.update({
      where: { id: jobId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    // Create view record
    return await prisma.jobView.create({
      data: {
        jobId
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
            applications: true,
            views: true
          }
        }
      }
    });
  }
}

