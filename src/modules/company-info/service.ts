import { PrismaClient } from '../../generated/prisma/index.js';
import { GetCompanyInfoDto, GetCompanyJobsDto } from './dto.js';

const prisma = new PrismaClient();

export class CompanyInfoService {
  // Lấy thông tin chi tiết công ty
  async getCompanyInfo(data: GetCompanyInfoDto) {
    const company = await prisma.company.findUnique({
      where: { 
        id: data.companyId,
        isActive: true // Chỉ hiển thị công ty đang hoạt động
      },
      include: {
        _count: {
          select: {
            jobs: {
              where: {
                isActive: true,
                isApproved: true
              }
            },
            members: true
          }
        }
      }
    });

    if (!company) {
      throw new Error('Company not found or not active');
    }

    // Lấy thống kê thêm
    const stats = await this.getCompanyStats(data.companyId);

    return {
      ...company,
      stats
    };
  }

  // Lấy danh sách việc làm của công ty
  async getCompanyJobs(data: GetCompanyJobsDto) {
    const where: any = {
      companyId: data.companyId,
      isActive: true,
      isApproved: true
    };

    if (data.type) {
      where.type = data.type;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
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
        },
        skip: (data.page - 1) * data.limit,
        take: data.limit
      }),
      prisma.job.count({ where })
    ]);

    return {
      jobs,
      pagination: {
        page: data.page,
        limit: data.limit,
        total,
        pages: Math.ceil(total / data.limit)
      }
    };
  }

  // Tìm kiếm công ty
  async searchCompanies(query: string, page: number = 1, limit: number = 10) {
    const where = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } }
      ]
    };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: {
            select: {
              jobs: {
                where: {
                  isActive: true,
                  isApproved: true
                }
              }
            }
          }
        },
        orderBy: {
          isVerified: 'desc' // Ưu tiên công ty đã xác minh
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.company.count({ where })
    ]);

    return {
      companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Lấy danh sách công ty nổi bật
  async getFeaturedCompanies(limit: number = 10) {
    return await prisma.company.findMany({
      where: {
        isActive: true,
        isVerified: true
      },
      include: {
        _count: {
          select: {
            jobs: {
              where: {
                isActive: true,
                isApproved: true
              }
            }
          }
        }
      },
      orderBy: [
        { isVerified: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });
  }

  // Lấy thống kê công ty
  private async getCompanyStats(companyId: string) {
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      totalViews,
      recentJobs
    ] = await Promise.all([
      prisma.job.count({
        where: { companyId }
      }),
      prisma.job.count({
        where: { 
          companyId,
          isActive: true,
          isApproved: true
        }
      }),
      prisma.application.count({
        where: {
          job: {
            companyId
          }
        }
      }),
      prisma.jobView.count({
        where: {
          job: {
            companyId
          }
        }
      }),
      prisma.job.findMany({
        where: {
          companyId,
          isActive: true,
          isApproved: true
        },
        select: {
          id: true,
          title: true,
          type: true,
          location: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ]);

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      totalViews,
      recentJobs
    };
  }
}
