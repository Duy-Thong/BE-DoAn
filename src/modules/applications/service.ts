import { prisma } from '../../loaders/prisma.js';
import type { CreateApplicationDto, UpdateApplicationDto, UpdateApplicationStatusDto } from './dto.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../../utils/error.js';

export class ApplicationsService {
  /**
   * List all applications (Admin only)
   */
  async list() {
    return prisma.application.findMany({
      select: {
        id: true,
        status: true,
        jobId: true,
        cvId: true,
        coverLetter: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        cv: {
          select: {
            id: true,
            title: true,
            fullName: true,
            userId: true,
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
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get application by ID
   */
  async getById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        cv: {
          select: {
            id: true,
            title: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            userId: true,
          }
        },
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
      }
    });
  }

  /**
   * Create new application
   */
  async create(userId: string, input: CreateApplicationDto) {
    // Kiểm tra job tồn tại và đang active
    const job = await prisma.job.findFirst({
      where: {
        id: input.jobId,
        isActive: true
      }
    });

    if (!job) {
      throw new ValidationError('Công việc không tồn tại hoặc không còn tuyển dụng');
    }

    // Kiểm tra job đã hết hạn chưa
    if (job.expiresAt && job.expiresAt < new Date()) {
      throw new ValidationError('Công việc đã hết hạn ứng tuyển');
    }

    // Kiểm tra CV thuộc về user
    const cv = await prisma.cV.findFirst({
      where: {
        id: input.cvId,
        userId
      }
    });

    if (!cv) {
      throw new ValidationError('CV không tồn tại hoặc không thuộc về bạn');
    }

    // Kiểm tra đã apply job này chưa
    const existingApplication = await prisma.application.findFirst({
      where: {
        cvId: input.cvId,
        jobId: input.jobId
      }
    });

    if (existingApplication) {
      throw new ValidationError('Bạn đã ứng tuyển công việc này rồi');
    }

    // Transaction: Tạo application và tăng applicationCount
    const application = await prisma.$transaction(async (tx) => {
      // Tạo application
      const app = await tx.application.create({
        data: {
          jobId: input.jobId,
          cvId: input.cvId,
          coverLetter: input.coverLetter ?? null,
          notes: input.notes ?? null,
          status: 'PENDING'
        },
        include: {
          cv: {
            select: {
              id: true,
              title: true,
              fullName: true,
              userId: true,
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
        }
      });

      // Tăng application count
      await tx.job.update({
        where: { id: input.jobId },
        data: {
          applicationCount: {
            increment: 1
          }
        }
      });

      return app;
    });

    return application;
  }

  /**
   * Update application (Candidate - only own applications)
   */
  async update(id: string, userId: string, input: UpdateApplicationDto) {
    // Kiểm tra application thuộc về user
    const application = await prisma.application.findFirst({
      where: {
        id,
        cv: {
          userId
        }
      }
    });

    if (!application) {
      throw new NotFoundError('Đơn ứng tuyển không tìm thấy hoặc không có quyền truy cập');
    }

    // Chỉ cho phép update nếu đơn còn PENDING
    if (application.status !== 'PENDING') {
      throw new ValidationError('Chỉ có thể cập nhật đơn ứng tuyển đang chờ xử lý');
    }

    // Nếu có cvId mới, kiểm tra CV thuộc về user
    if (input.cvId && input.cvId !== application.cvId) {
      const cv = await prisma.cV.findFirst({
        where: {
          id: input.cvId,
          userId
        }
      });

      if (!cv) {
        throw new ValidationError('CV không tồn tại hoặc không thuộc về bạn');
      }

      // Kiểm tra CV mới đã apply job này chưa
      const existingApplication = await prisma.application.findFirst({
        where: {
          cvId: input.cvId,
          jobId: application.jobId,
          id: { not: id }
        }
      });

      if (existingApplication) {
        throw new ValidationError('CV này đã được dùng để ứng tuyển công việc này rồi');
      }
    }

    const updateData: any = {};
    if (input.cvId !== undefined) updateData.cvId = input.cvId;
    if (input.coverLetter !== undefined) updateData.coverLetter = input.coverLetter ?? null;
    if (input.notes !== undefined) updateData.notes = input.notes ?? null;

    return prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        cv: {
          select: {
            id: true,
            title: true,
            fullName: true,
            userId: true,
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
      }
    });
  }

  /**
   * Update application status (Recruiter/Company)
   */
  async updateStatus(id: string, userId: string, input: UpdateApplicationStatusDto) {
    // Lấy application với thông tin job và company
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: {
              include: {
                users: {
                  where: { id: userId }
                }
              }
            }
          }
        }
      }
    });

    if (!application) {
      throw new NotFoundError('Đơn ứng tuyển không tìm thấy');
    }

    // Kiểm tra user có quyền update status không
    const companyUser = application.job.company.users[0];
    if (!companyUser || !['OWNER', 'MANAGER', 'RECRUITER'].includes(companyUser.companyRole || '')) {
      throw new AuthorizationError('Không có quyền cập nhật trạng thái đơn ứng tuyển');
    }

    const updateData: any = {
      status: input.status
    };
    if (input.notes !== undefined) {
      updateData.notes = input.notes ?? null;
    }

    return prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        cv: {
          select: {
            id: true,
            title: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            userId: true,
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
      }
    });
  }

  /**
   * Get user's applications (Candidate)
   */
  async getUserApplications(userId: string) {
    return prisma.application.findMany({
      where: {
        cv: {
          userId
        }
      },
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
            location: true,
            type: true,
            salary: true,
            urgent: true,
            expiresAt: true,
            company: {
              select: {
                name: true,
                logoUrl: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get applications for a job (Recruiter/Company)
   */
  async getJobApplications(jobId: string, userId: string) {
    // Kiểm tra quyền truy cập job
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        company: {
          users: {
            some: {
              id: userId,
              companyRole: { in: ['OWNER', 'MANAGER', 'RECRUITER'] }
            }
          }
        }
      }
    });

    if (!job) {
      throw new AuthorizationError('Không có quyền xem danh sách ứng tuyển của công việc này');
    }

    return prisma.application.findMany({
      where: { jobId },
      include: {
        cv: {
          select: {
            id: true,
            title: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            currentPosition: true,
            summary: true,
            userId: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Delete application (Candidate - only own applications)
   */
  async delete(id: string, userId: string) {
    // Kiểm tra application thuộc về user
    const application = await prisma.application.findFirst({
      where: {
        id,
        cv: {
          userId
        }
      }
    });

    if (!application) {
      throw new NotFoundError('Đơn ứng tuyển không tìm thấy hoặc không có quyền truy cập');
    }

    // Chỉ cho phép xóa nếu đơn còn PENDING
    if (application.status !== 'PENDING') {
      throw new ValidationError('Chỉ có thể xóa đơn ứng tuyển đang chờ xử lý');
    }

    // Transaction: Xóa application và giảm applicationCount
    await prisma.$transaction(async (tx) => {
      // Xóa application
      await tx.application.delete({ where: { id } });

      // Giảm application count
      await tx.job.update({
        where: { id: application.jobId },
        data: {
          applicationCount: {
            decrement: 1
          }
        }
      });
    });
  }

  /**
   * Get company's all applications (Company owner/manager/recruiter)
   */
  async getCompanyApplications(companyId: string, userId: string) {
    // Kiểm tra user thuộc company và có quyền
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
        companyRole: { in: ['OWNER', 'MANAGER', 'RECRUITER'] }
      }
    });

    if (!user) {
      throw new AuthorizationError('Không có quyền xem danh sách ứng tuyển của công ty');
    }

    return prisma.application.findMany({
      where: {
        job: {
          companyId
        }
      },
      include: {
        cv: {
          select: {
            id: true,
            title: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            currentPosition: true,
            userId: true,
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            type: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
