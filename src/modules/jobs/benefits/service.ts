import { prisma } from '../../../loaders/prisma.js';
import { CreateJobBenefitDto, UpdateJobBenefitDto } from './dto.js';

export class JobBenefitService {
  // Tạo phúc lợi công việc mới
  async createJobBenefit(jobId: string, userId: string, data: CreateJobBenefitDto) {
    // Kiểm tra quyền truy cập job
    await this.verifyJobAccess(jobId, userId);

    return await prisma.jobBenefit.create({
      data: {
        title: data.title,
        description: data.description,
        jobId
      }
    });
  }

  // Lấy danh sách phúc lợi của job
  async getJobBenefits(jobId: string, userId: string) {
    // Kiểm tra quyền truy cập job
    await this.verifyJobAccess(jobId, userId);

    return await prisma.jobBenefit.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' }
    });
  }

  // Lấy phúc lợi theo ID
  async getJobBenefitById(benefitId: string, jobId: string, userId: string) {
    // Kiểm tra quyền truy cập job
    await this.verifyJobAccess(jobId, userId);

    return await prisma.jobBenefit.findFirst({
      where: {
        id: benefitId,
        jobId
      }
    });
  }

  // Cập nhật phúc lợi
  async updateJobBenefit(benefitId: string, jobId: string, userId: string, data: UpdateJobBenefitDto) {
    // Kiểm tra quyền truy cập job
    await this.verifyJobAccess(jobId, userId);

    // Kiểm tra benefit tồn tại
    const benefit = await this.getJobBenefitById(benefitId, jobId, userId);
    if (!benefit) {
      throw new Error('Phúc lợi không tìm thấy');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;

    return await prisma.jobBenefit.update({
      where: { id: benefitId },
      data: updateData
    });
  }

  // Xóa phúc lợi
  async deleteJobBenefit(benefitId: string, jobId: string, userId: string) {
    // Kiểm tra quyền truy cập job
    await this.verifyJobAccess(jobId, userId);

    // Kiểm tra benefit tồn tại
    const benefit = await this.getJobBenefitById(benefitId, jobId, userId);
    if (!benefit) {
      throw new Error('Phúc lợi không tìm thấy');
    }

    return await prisma.jobBenefit.delete({
      where: { id: benefitId }
    });
  }

  // Kiểm tra quyền truy cập job
  private async verifyJobAccess(jobId: string, userId: string) {
    // Kiểm tra job thuộc về công ty mà user có quyền
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

    return job;
  }
}
