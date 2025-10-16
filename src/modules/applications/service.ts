import { prisma } from '../../loaders/prisma.js';
import type { CreateApplicationDto, UpdateApplicationDto, UpdateApplicationStatusDto } from './dto.js';

export class ApplicationsService {
  async list() {
    return prisma.application.findMany({ 
      select: { 
        id: true, 
        status: true, 
        userId: true, 
        jobId: true, 
        cvId: true,
        coverLetter: true,
        appliedAt: true,
        availableFrom: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        cv: {
          select: {
            id: true,
            title: true,
            fullName: true,
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async create(userId: string, input: CreateApplicationDto) {
    // Kiểm tra job tồn tại và đang active
    const job = await prisma.job.findFirst({
      where: {
        id: input.jobId,
        isActive: true,
        isApproved: true
      }
    });

    if (!job) {
      throw new Error('Công việc không tồn tại hoặc không còn tuyển dụng');
    }

    // Kiểm tra user đã apply job này chưa
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId,
        jobId: input.jobId
      }
    });

    if (existingApplication) {
      throw new Error('Bạn đã ứng tuyển công việc này rồi');
    }

    // Nếu có cvId, kiểm tra CV thuộc về user
    if (input.cvId) {
      const cv = await prisma.cV.findFirst({
        where: {
          id: input.cvId,
          userId
        }
      });

      if (!cv) {
        throw new Error('CV không tồn tại hoặc không thuộc về bạn');
      }
    }

    const application = await prisma.application.create({ 
      data: { 
        userId, 
        jobId: input.jobId, 
        cvId: input.cvId ?? null,
        coverLetter: input.coverLetter ?? null,
        availableFrom: input.availableFrom ? new Date(input.availableFrom) : null,
        notes: input.notes ?? null
      } 
    });

    // Tăng application count cho job
    await prisma.job.update({
      where: { id: input.jobId },
      data: {
        applicationCount: {
          increment: 1
        }
      }
    });

    return application;
  }

  async getById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        cv: {
          select: {
            id: true,
            title: true,
            fullName: true,
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true,
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    });
  }

  async update(id: string, userId: string, input: UpdateApplicationDto) {
    // Kiểm tra application thuộc về user
    const application = await prisma.application.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!application) {
      throw new Error('Đơn ứng tuyển không tìm thấy hoặc không có quyền truy cập');
    }

    // Nếu có cvId, kiểm tra CV thuộc về user
    if (input.cvId) {
      const cv = await prisma.cV.findFirst({
        where: {
          id: input.cvId,
          userId
        }
      });

      if (!cv) {
        throw new Error('CV không tồn tại hoặc không thuộc về bạn');
      }
    }

    const updateData: any = {};
    if (input.cvId !== undefined) updateData.cvId = input.cvId;
    if (input.coverLetter !== undefined) updateData.coverLetter = input.coverLetter;
    if (input.availableFrom !== undefined) updateData.availableFrom = input.availableFrom ? new Date(input.availableFrom) : null;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.status !== undefined) updateData.status = input.status;

    return prisma.application.update({ 
      where: { id }, 
      data: updateData 
    });
  }

  async updateStatus(id: string, userId: string, input: UpdateApplicationStatusDto) {
    // Kiểm tra quyền truy cập (chỉ recruiter/company member mới được update status)
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: {
              include: {
                members: true
              }
            }
          }
        }
      }
    });

    if (!application) {
      throw new Error('Đơn ứng tuyển không tìm thấy');
    }

    // Kiểm tra user có quyền update status không
    const hasPermission = application.job.company.members.some(
      member => member.userId === userId && ['OWNER', 'MANAGER', 'RECRUITER'].includes(member.role)
    );

    if (!hasPermission) {
      throw new Error('Không có quyền cập nhật trạng thái đơn ứng tuyển');
    }

    const updateData: any = {
      status: input.status
    };
    if (input.notes !== undefined) updateData.notes = input.notes;

    return prisma.application.update({ 
      where: { id }, 
      data: updateData 
    });
  }

  async getUserApplications(userId: string) {
    return prisma.application.findMany({
      where: { userId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            type: true,
            salary: true,
            company: {
              select: {
                name: true,
                logoUrl: true,
              }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async getJobApplications(jobId: string, userId: string) {
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

    return prisma.application.findMany({
      where: { jobId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          }
        },
        cv: {
          select: {
            id: true,
            title: true,
            fullName: true,
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async delete(id: string, userId: string) {
    // Kiểm tra application thuộc về user
    const application = await prisma.application.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!application) {
      throw new Error('Đơn ứng tuyển không tìm thấy hoặc không có quyền truy cập');
    }

    // Giảm application count cho job
    await prisma.job.update({
      where: { id: application.jobId },
      data: {
        applicationCount: {
          decrement: 1
        }
      }
    });

    return prisma.application.delete({ where: { id } });
  }
}

