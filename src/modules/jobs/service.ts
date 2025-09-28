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
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async create(input: CreateJobDto) {
    const data: any = {
      title: input.title,
      description: input.description,
      location: input.location ?? null,
      type: (input.type as any) || 'FULL_TIME',
      salary: input.salary ?? null,
      requirements: input.requirements ?? null,
      benefits: input.benefits ?? null,
      companyId: input.companyId,
      isActive: false, // Cần được duyệt trước khi active
      isApproved: false
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
    if (input.requirements !== undefined) data.requirements = input.requirements ?? null;
    if (input.benefits !== undefined) data.benefits = input.benefits ?? null;
    if (input.expiresAt !== undefined) data.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    
    // Khi update, cần duyệt lại
    data.isApproved = false;
    data.isActive = false;

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
      isReposted: true,
      repostedAt: new Date(),
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
}

