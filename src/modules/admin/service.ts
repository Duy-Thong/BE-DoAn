import { PrismaClient } from '../../generated/prisma/index.js';
import { GetUsersDto, UpdateUserStatusDto, DeleteUserDto, GetJobsDto, ApproveJobDto, GetCompaniesDto, VerifyCompanyDto } from './dto.js';

const prisma = new PrismaClient();

export class AdminService {
  // Lấy danh sách users với filter
  async getUsers(filters: GetUsersDto) {
    const where: any = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.isLocked !== undefined) {
      where.isLocked = filters.isLocked;
    }

    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true,
          company: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              applications: true,
              cvs: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit)
      }
    };
  }

  // Cập nhật trạng thái user
  async updateUserStatus(data: UpdateUserStatusDto) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Không cho phép khóa admin khác
    if (user.role === 'ADMIN' && data.isLocked) {
      throw new Error('Cannot lock admin users');
    }

    return await prisma.user.update({
      where: { id: data.userId },
      data: {
        isActive: data.isActive,
        isLocked: data.isLocked
      },
      include: {
        profile: true,
        company: {
          select: {
            name: true
          }
        }
      }
    });
  }

  // Xóa user
  async deleteUser(data: DeleteUserDto) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Không cho phép xóa admin
    if (user.role === 'ADMIN') {
      throw new Error('Cannot delete admin users');
    }

    // Xóa các dữ liệu liên quan
    await prisma.$transaction(async (tx) => {
      // Xóa applications
      await tx.application.deleteMany({
        where: { userId: data.userId }
      });

      // Xóa CVs
      await tx.cV.deleteMany({
        where: { userId: data.userId }
      });

      // Xóa saved jobs
      await tx.savedJob.deleteMany({
        where: { userId: data.userId }
      });

      // Xóa job alerts
      await tx.jobAlert.deleteMany({
        where: { userId: data.userId }
      });

      // Xóa job recommendations
      await tx.jobRecommendation.deleteMany({
        where: { userId: data.userId }
      });

      // Xóa internal notes
      await tx.internalNote.deleteMany({
        where: { authorId: data.userId }
      });

      // Xóa company memberships
      await tx.companyMember.deleteMany({
        where: { userId: data.userId }
      });

      // Xóa profile
      await tx.profile.deleteMany({
        where: { userId: data.userId }
      });

      // Xóa user
      await tx.user.delete({
        where: { id: data.userId }
      });
    });

    return { message: 'User deleted successfully' };
  }

  // Lấy danh sách jobs cần kiểm duyệt
  async getJobs(filters: GetJobsDto) {
    const where: any = {};

    if (filters.isApproved !== undefined) {
      where.isApproved = filters.isApproved;
    }

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              name: true,
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
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      prisma.job.count({ where })
    ]);

    return {
      jobs,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit)
      }
    };
  }

  // Duyệt/từ chối job
  async approveJob(data: ApproveJobDto) {
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
      include: {
        company: true
      }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    return await prisma.job.update({
      where: { id: data.jobId },
      data: {
        isApproved: data.isApproved,
        isActive: data.isApproved // Chỉ active khi được duyệt
      },
      include: {
        company: {
          select: {
            name: true,
            isVerified: true
          }
        }
      }
    });
  }

  // Lấy danh sách companies cần kiểm duyệt
  async getCompanies(filters: GetCompaniesDto) {
    const where: any = {};

    if (filters.isVerified !== undefined) {
      where.isVerified = filters.isVerified;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: {
            select: {
              jobs: true,
              members: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      prisma.company.count({ where })
    ]);

    return {
      companies,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit)
      }
    };
  }

  // Xác minh company
  async verifyCompany(data: VerifyCompanyDto) {
    const company = await prisma.company.findUnique({
      where: { id: data.companyId }
    });

    if (!company) {
      throw new Error('Company not found');
    }

    return await prisma.company.update({
      where: { id: data.companyId },
      data: {
        isVerified: data.isVerified,
        isActive: data.isVerified // Chỉ active khi được xác minh
      }
    });
  }

  // Thống kê tổng quan
  async getDashboardStats() {
    const [
      totalUsers,
      totalCompanies,
      totalJobs,
      totalApplications,
      pendingJobs,
      pendingCompanies,
      activeUsers,
      lockedUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.job.count({ where: { isApproved: false } }),
      prisma.company.count({ where: { isVerified: false } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isLocked: true } })
    ]);

    return {
      totalUsers,
      totalCompanies,
      totalJobs,
      totalApplications,
      pendingJobs,
      pendingCompanies,
      activeUsers,
      lockedUsers
    };
  }
}
