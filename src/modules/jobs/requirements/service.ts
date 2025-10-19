import { prisma } from '../../../loaders/prisma.js';
import { CreateJobRequirementDto, UpdateJobRequirementDto } from './dto.js';

export class JobRequirementService {
  // Tạo yêu cầu công việc mới
  async createJobRequirement(jobId: string, userId: string, data: CreateJobRequirementDto) {
    // Kiểm tra quyền truy cập job
    await this.verifyJobAccess(jobId, userId);

    return await prisma.jobRequirement.create({
      data: {
        title: data.title,
        description: data.description,
        jobId
      }
    });
  }

  // Lấy danh sách yêu cầu của job
  async getJobRequirements(jobId: string, userId: string) {
    // Kiểm tra quyền truy cập job
    await this.verifyJobAccess(jobId, userId);

    return await prisma.jobRequirement.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' }
    });
  }

  // Lấy yêu cầu theo ID
  async getJobRequirementById(requirementId: string, jobId: string, userId: string) {
    // Kiểm tra quyền truy cập job
    await this.verifyJobAccess(jobId, userId);

    return await prisma.jobRequirement.findFirst({
      where: {
        id: requirementId,
        jobId
      }
    });
  }

  // Cập nhật yêu cầu
  async updateJobRequirement(requirementId: string, jobId: string, userId: string, data: UpdateJobRequirementDto) {
    // Kiểm tra quyền truy cập job
    await this.verifyJobAccess(jobId, userId);

    // Kiểm tra requirement tồn tại
    const requirement = await this.getJobRequirementById(requirementId, jobId, userId);
    if (!requirement) {
      throw new Error('Yêu cầu không tìm thấy');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;

    return await prisma.jobRequirement.update({
      where: { id: requirementId },
      data: updateData
    });
  }

  // Xóa yêu cầu
  async deleteJobRequirement(requirementId: string, jobId: string, userId: string) {
    // Kiểm tra quyền truy cập job
    await this.verifyJobAccess(jobId, userId);

    // Kiểm tra requirement tồn tại
    const requirement = await this.getJobRequirementById(requirementId, jobId, userId);
    if (!requirement) {
      throw new Error('Yêu cầu không tìm thấy');
    }

    return await prisma.jobRequirement.delete({
      where: { id: requirementId }
    });
  }

  // Kiểm tra quyền truy cập job
  private async verifyJobAccess(jobId: string, userId: string) {
    // Kiểm tra job thuộc về công ty mà user có quyền
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
      throw new Error('Job không tìm thấy hoặc không có quyền truy cập');
    }

    return job;
  }
}
