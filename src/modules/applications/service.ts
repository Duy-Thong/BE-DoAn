import type { CreateApplicationDto, UpdateApplicationDto, UpdateApplicationStatusDto } from './dto.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../../utils/error.js';
import { ApplicationRepository } from './repository.js';

export class ApplicationsService {
  private repository: ApplicationRepository;

  constructor(repository: ApplicationRepository) {
    this.repository = repository;
  }

  /**
   * List all applications (Admin and Recruiter)
   */
  async list(userId: string) {
    // Kiểm tra user có quyền xem tất cả applications không
    const user = await this.repository.findUserWithRole(userId);

    if (!user) {
      throw new AuthorizationError('User không tồn tại');
    }

    // Admin có thể xem tất cả, Recruiter chỉ xem của company mình
    let whereCondition: any = {};
    
    if (user.role !== 'ADMIN') {
      whereCondition = {
        job: {
          company: {
            users: {
              some: {
                id: userId,
                companyRole: { in: ['OWNER', 'MANAGER', 'RECRUITER'] }
              }
            }
          }
        }
      };
    }

    return this.repository.findMany(whereCondition);
  }

  /**
   * Get application by ID
   */
  async getById(id: string) {
    return this.repository.findById(id);
  }

  /**
   * Create new application
   */
  async create(userId: string, input: CreateApplicationDto) {
    // Kiểm tra job tồn tại và đang active
    const job = await this.repository.findJobById(input.jobId);

    if (!job) {
      throw new ValidationError('Công việc không tồn tại hoặc không còn tuyển dụng');
    }

    // Kiểm tra job đã hết hạn chưa
    if (job.expiresAt && job.expiresAt < new Date()) {
      throw new ValidationError('Công việc đã hết hạn ứng tuyển');
    }

    // Kiểm tra CV thuộc về user
    const cv = await this.repository.findCvByIdAndUserId(input.cvId, userId);

    if (!cv) {
      throw new ValidationError('CV không tồn tại hoặc không thuộc về bạn');
    }

    // Kiểm tra đã apply job này chưa
    const existingApplication = await this.repository.findByCvAndJob(input.cvId, input.jobId);

    if (existingApplication) {
      throw new ValidationError('Bạn đã ứng tuyển công việc này rồi');
    }

    // Transaction: Tạo application và tăng applicationCount
    const application = await this.repository.executeTransaction(async (tx) => {
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
    const application = await this.repository.findByIdAndUserId(id, userId);

    if (!application) {
      throw new NotFoundError('Đơn ứng tuyển không tìm thấy hoặc không có quyền truy cập');
    }

    // Chỉ cho phép update nếu đơn còn PENDING
    if (application.status !== 'PENDING') {
      throw new ValidationError('Chỉ có thể cập nhật đơn ứng tuyển đang chờ xử lý');
    }

    // Nếu có cvId mới, kiểm tra CV thuộc về user
    if (input.cvId && input.cvId !== application.cvId) {
      const cv = await this.repository.findCvByIdAndUserId(input.cvId, userId);

      if (!cv) {
        throw new ValidationError('CV không tồn tại hoặc không thuộc về bạn');
      }

      // Kiểm tra CV mới đã apply job này chưa
      const existingApplication = await this.repository.findByCvAndJob(input.cvId, application.jobId, id);

      if (existingApplication) {
        throw new ValidationError('CV này đã được dùng để ứng tuyển công việc này rồi');
      }
    }

    const updateData: any = {};
    if (input.cvId !== undefined) updateData.cvId = input.cvId;
    if (input.coverLetter !== undefined) updateData.coverLetter = input.coverLetter ?? null;
    if (input.notes !== undefined) updateData.notes = input.notes ?? null;

    return this.repository.update(id, updateData);
  }

  /**
   * Update application status (Recruiter/Company)
   */
  async updateStatus(id: string, userId: string, input: UpdateApplicationStatusDto) {
    // Lấy application với thông tin job và company
    const application = await this.repository.findByIdWithJobAndCompany(id, userId);

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

    return this.repository.updateStatus(id, updateData);
  }

  /**
   * Get user's applications (Candidate)
   */
  async getUserApplications(userId: string) {
    return this.repository.findByUserId(userId);
  }

  /**
   * Get applications for a job (Recruiter/Company)
   */
  async getJobApplications(jobId: string, userId: string) {
    // Kiểm tra quyền truy cập job
    const job = await this.repository.findJobWithCompanyUsers(jobId, userId);

    if (!job) {
      throw new AuthorizationError('Không có quyền xem danh sách ứng tuyển của công việc này');
    }

    return this.repository.findByJobId(jobId);
  }

  /**
   * Delete application (Candidate - only own applications)
   */
  async delete(id: string, userId: string) {
    // Kiểm tra application thuộc về user
    const application = await this.repository.findByIdAndUserId(id, userId);

    if (!application) {
      throw new NotFoundError('Đơn ứng tuyển không tìm thấy hoặc không có quyền truy cập');
    }

    // Chỉ cho phép xóa nếu đơn còn PENDING
    if (application.status !== 'PENDING') {
      throw new ValidationError('Chỉ có thể xóa đơn ứng tuyển đang chờ xử lý');
    }

    // Transaction: Xóa application và giảm applicationCount
    await this.repository.executeTransaction(async (tx) => {
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

}
