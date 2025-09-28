import { PrismaClient } from '../../generated/prisma/index.js';
import { CreateApplicationDto, UpdateApplicationStatusDto, AddInternalNoteDto, GetApplicationsDto } from './dto.js';

const prisma = new PrismaClient();

export class ApplicationManagementService {
  // Ứng viên ứng tuyển việc làm
  async createApplication(userId: string, data: CreateApplicationDto) {
    // Kiểm tra job có tồn tại và đang active
    const job = await prisma.job.findFirst({
      where: {
        id: data.jobId,
        isActive: true,
        isApproved: true
      }
    });

    if (!job) {
      throw new Error('Job not found or not available');
    }

    // Kiểm tra đã ứng tuyển chưa
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId,
        jobId: data.jobId
      }
    });

    if (existingApplication) {
      throw new Error('You have already applied for this job');
    }

    // Nếu có CV ID, kiểm tra CV thuộc về user
    if (data.cvId) {
      const cv = await prisma.cV.findFirst({
        where: {
          id: data.cvId,
          userId
        }
      });

      if (!cv) {
        throw new Error('CV not found or access denied');
      }
    }

    // Tạo application
    const application = await prisma.application.create({
      data: {
        userId,
        jobId: data.jobId,
        cvId: data.cvId,
        coverLetter: data.coverLetter,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true
              }
            }
          }
        },
        cv: {
          select: {
            id: true,
            title: true,
            fileName: true
          }
        }
      }
    });

    return application;
  }

  // Lấy danh sách ứng tuyển cho nhà tuyển dụng
  async getApplicationsForRecruiter(companyId: string, requesterId: string, filters: GetApplicationsDto) {
    // Kiểm tra quyền truy cập
    const hasPermission = await this.checkRecruiterPermission(companyId, requesterId);
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    const where: any = {
      job: {
        companyId
      }
    };

    if (filters.jobId) {
      where.jobId = filters.jobId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profile: true
            }
          },
          job: {
            select: {
              id: true,
              title: true
            }
          },
          cv: {
            select: {
              id: true,
              title: true,
              fileName: true
            }
          },
          internalNotes: {
            include: {
              author: {
                select: {
                  fullName: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      prisma.application.count({ where })
    ]);

    return {
      applications,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit)
      }
    };
  }

  // Lấy danh sách ứng tuyển của ứng viên
  async getUserApplications(userId: string, filters: Partial<GetApplicationsDto>) {
    const where: any = { userId };

    if (filters.status) {
      where.status = filters.status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
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
                  logoUrl: true
                }
              }
            }
          },
          cv: {
            select: {
              id: true,
              title: true,
              fileName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10
      }),
      prisma.application.count({ where })
    ]);

    return {
      applications,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        total,
        pages: Math.ceil(total / (filters.limit || 10))
      }
    };
  }

  // Cập nhật trạng thái ứng tuyển
  async updateApplicationStatus(companyId: string, requesterId: string, data: UpdateApplicationStatusDto) {
    // Kiểm tra quyền truy cập
    const hasPermission = await this.checkRecruiterPermission(companyId, requesterId);
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Kiểm tra application thuộc về công ty
    const application = await prisma.application.findFirst({
      where: {
        id: data.applicationId,
        job: {
          companyId
        }
      }
    });

    if (!application) {
      throw new Error('Application not found or access denied');
    }

    return await prisma.application.update({
      where: { id: data.applicationId },
      data: { status: data.status },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
  }

  // Thêm ghi chú nội bộ
  async addInternalNote(companyId: string, requesterId: string, data: AddInternalNoteDto) {
    // Kiểm tra quyền truy cập
    const hasPermission = await this.checkRecruiterPermission(companyId, requesterId);
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Kiểm tra application thuộc về công ty
    const application = await prisma.application.findFirst({
      where: {
        id: data.applicationId,
        job: {
          companyId
        }
      }
    });

    if (!application) {
      throw new Error('Application not found or access denied');
    }

    return await prisma.internalNote.create({
      data: {
        content: data.content,
        isPrivate: data.isPrivate,
        authorId: requesterId,
        applicationId: data.applicationId
      },
      include: {
        author: {
          select: {
            fullName: true
          }
        }
      }
    });
  }

  // Lấy chi tiết ứng viên
  async getCandidateDetails(companyId: string, requesterId: string, candidateId: string) {
    // Kiểm tra quyền truy cập
    const hasPermission = await this.checkRecruiterPermission(companyId, requesterId);
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    const candidate = await prisma.user.findFirst({
      where: {
        id: candidateId,
        applications: {
          some: {
            job: {
              companyId
            }
          }
        }
      },
      include: {
        profile: true,
        applications: {
          where: {
            job: {
              companyId
            }
          },
          include: {
            job: {
              select: {
                id: true,
                title: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!candidate) {
      throw new Error('Candidate not found or access denied');
    }

    return candidate;
  }

  // Kiểm tra quyền recruiter
  private async checkRecruiterPermission(companyId: string, userId: string) {
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
