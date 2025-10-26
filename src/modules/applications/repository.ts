import { prisma } from '../../loaders/prisma.js';
import type { CreateApplicationDto, UpdateApplicationDto, UpdateApplicationStatusDto } from './dto.js';

export class ApplicationRepository {
  /**
   * Find all applications with optional filtering
   */
  async findMany(whereCondition: any = {}) {
    return prisma.application.findMany({
      where: whereCondition,
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
   * Find application by ID with full details
   */
  async findById(id: string) {
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
   * Find application by ID with basic info
   */
  async findByIdBasic(id: string) {
    return prisma.application.findUnique({
      where: { id },
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
   * Find applications by user ID (through CV)
   */
  async findByUserId(userId: string) {
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
   * Find applications by job ID
   */
  async findByJobId(jobId: string) {
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
   * Find application by CV and Job (for duplicate check)
   * Chỉ kiểm tra các đơn đang PENDING hoặc ACCEPTED
   * Cho phép ứng tuyển lại nếu đã bị REJECTED
   */
  async findByCvAndJob(cvId: string, jobId: string, excludeId?: string) {
    return prisma.application.findFirst({
      where: {
        cvId,
        jobId,
        status: { in: ['PENDING', 'ACCEPTED'] }, // Chỉ chặn nếu đang pending hoặc đã accepted
        ...(excludeId && { id: { not: excludeId } })
      }
    });
  }

  /**
   * Find application by ID and user ID (for ownership check)
   */
  async findByIdAndUserId(id: string, userId: string) {
    return prisma.application.findFirst({
      where: {
        id,
        cv: {
          userId
        }
      }
    });
  }

  /**
   * Find application with job and company info for permission check
   */
  async findByIdWithJobAndCompany(id: string, userId: string) {
    return prisma.application.findUnique({
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
  }

  /**
   * Find job with company users for permission check
   */
  async findJobWithCompanyUsers(jobId: string, userId: string) {
    return prisma.job.findFirst({
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
  }

  /**
   * Find user with role info
   */
  async findUserWithRole(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, companyId: true, companyRole: true }
    });
  }

  /**
   * Find job by ID with basic info
   */
  async findJobById(jobId: string) {
    return prisma.job.findFirst({
      where: {
        id: jobId,
        isActive: true
      }
    });
  }

  /**
   * Find CV by ID and user ID
   */
  async findCvByIdAndUserId(cvId: string, userId: string) {
    return prisma.cV.findFirst({
      where: {
        id: cvId,
        userId
      }
    });
  }

  /**
   * Create new application
   */
  async create(data: {
    jobId: string;
    cvId: string;
    coverLetter?: string | null;
    notes?: string | null;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  }) {
    return prisma.application.create({
      data,
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
   * Update application
   */
  async update(id: string, data: {
    cvId?: string;
    coverLetter?: string | null;
    notes?: string | null;
  }) {
    return prisma.application.update({
      where: { id },
      data,
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
   * Update application status
   */
  async updateStatus(id: string, data: {
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    notes?: string | null;
  }) {
    return prisma.application.update({
      where: { id },
      data,
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
   * Delete application
   */
  async delete(id: string) {
    return prisma.application.delete({
      where: { id }
    });
  }

  /**
   * Increment job application count
   */
  async incrementJobApplicationCount(jobId: string) {
    return prisma.job.update({
      where: { id: jobId },
      data: {
        applicationCount: {
          increment: 1
        }
      }
    });
  }

  /**
   * Decrement job application count
   */
  async decrementJobApplicationCount(jobId: string) {
    return prisma.job.update({
      where: { id: jobId },
      data: {
        applicationCount: {
          decrement: 1
        }
      }
    });
  }

  /**
   * Execute transaction
   */
  async executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback);
  }
}
