import { prisma } from '../../loaders/prisma.js';
import type { CreateJobDto, UpdateJobDto, RepostJobDto } from './dto.js';

export class JobsService {
  async list(options?: {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    industry?: string;
    experienceLevel?: string;
    type?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = options?.sortBy || 'createdAt';
    const sortOrder = options?.sortOrder || 'desc';

    // Build where clause
    const where: any = {};
    
    // Default to active jobs only if isActive is not explicitly set
    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    } else {
      where.isActive = true;
    }

    // Add search filter
    if (options?.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } }
      ];
    }

    // Add location filter
    if (options?.location) {
      where.location = { contains: options.location, mode: 'insensitive' };
    }

    // Add industry filter
    if (options?.industry) {
      where.industry = { contains: options.industry, mode: 'insensitive' };
    }

    // Add experience level filter
    if (options?.experienceLevel) {
      where.experienceLevel = options.experienceLevel;
    }

    // Add type filter
    if (options?.type) {
      where.type = options.type;
    }

    // Get total count
    const total = await prisma.job.count({ where });

    // Build orderBy
    // Always sort by urgent first (if not explicitly sorting by urgent), then by the specified field
    let orderBy: any = [];
    if (sortBy === 'urgent') {
      orderBy = [
        { urgent: sortOrder },
        { createdAt: 'desc' }
      ];
    } else {
      // Sort by urgent first, then by the specified field
      orderBy = [
        { urgent: 'desc' },
        { [sortBy]: sortOrder }
      ];
    }

    // Get jobs with pagination
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
        requirements: true,
        benefits: true,
        jobSkills: true,
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    });

    // Remove embedding from response (not needed for frontend, reduces payload size)
    const jobsWithoutEmbedding = jobs.map(({ embedding, ...job }) => job);

    return {
      data: jobsWithoutEmbedding,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
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

  // Get jobs by IDs (for AI recommendations)
  async getByIds(jobIds: string[]) {
    const jobs = await prisma.job.findMany({ 
      where: { 
        id: { in: jobIds },
        isActive: true // Only get active jobs
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
      }
    });

    // Remove embedding from response (not needed for frontend, reduces payload size)
    const jobsWithoutEmbedding = jobs.map(({ embedding, ...job }) => job);

    // Preserve order from jobIds array
    const jobMap = new Map(jobsWithoutEmbedding.map(job => [job.id, job]));
    const orderedJobs = jobIds
      .map(id => jobMap.get(id))
      .filter((job): job is NonNullable<typeof job> => job !== undefined);

    return orderedJobs;
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

    // Handle nested data updates (replace all strategy)
    // Nếu có requirements trong input, xóa hết cũ và tạo mới
    if (input.requirements !== undefined) {
      data.requirements = {
        deleteMany: {}, // Xóa tất cả requirements cũ
        create: input.requirements.map(req => ({
          title: req.title,
          description: req.description
        }))
      };
    }

    // Nếu có benefits trong input, xóa hết cũ và tạo mới
    if (input.benefits !== undefined) {
      data.benefits = {
        deleteMany: {}, // Xóa tất cả benefits cũ
        create: input.benefits.map(benefit => ({
          title: benefit.title,
          description: benefit.description
        }))
      };
    }

    // Nếu có skills trong input, xóa hết cũ và tạo mới
    if (input.skills !== undefined) {
      data.jobSkills = {
        deleteMany: {}, // Xóa tất cả skills cũ
        create: input.skills.map(skill => ({
          skillName: skill.skillName,
          isRequired: skill.isRequired
        }))
      };
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

  // Lấy danh sách jobs của công ty (cho HR - trả về tất cả jobs)
  async getCompanyJobs(
    companyId: string, 
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      isActive?: boolean;
    }
  ) {
    // Kiểm tra quyền truy cập
    const hasPermission = await this.checkJobPermission(companyId, userId);
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = options?.sortBy || 'createdAt';
    const sortOrder = options?.sortOrder || 'desc';

    // Build where clause
    const where: any = { companyId };
    
    // Chỉ filter isActive nếu được chỉ định rõ ràng
    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    // Get total count
    const total = await prisma.job.count({ where });

    // Get jobs
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
        requirements: true,
        benefits: true,
        jobSkills: true,
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take: limit
    });

    // Remove embedding from response (not needed for frontend, reduces payload size)
    const jobsWithoutEmbedding = jobs.map(({ embedding, ...job }) => job);

    return {
      data: jobsWithoutEmbedding,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
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

