import { prisma } from '../../../loaders/prisma.js';
import { CreateWorkExperienceDto, UpdateWorkExperienceDto } from './dto.js';
import { BaseCVService } from '../base-cv-service.js';
import { createNotFoundError } from '../../../utils/error.js';

export class WorkExperienceService extends BaseCVService {
  // Tạo kinh nghiệm làm việc mới
  async createWorkExperience(cvId: string, userId: string, data: CreateWorkExperienceDto) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    return await prisma.workExperience.create({
      data: {
        title: data.title,
        company: data.company,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        description: data.description,
        cvId
      }
    });
  }

  // Lấy danh sách kinh nghiệm làm việc của CV
  async getWorkExperiences(cvId: string, userId: string) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    return await prisma.workExperience.findMany({
      where: { cvId },
      orderBy: { startDate: 'desc' }
    });
  }

  // Lấy kinh nghiệm làm việc theo ID
  async getWorkExperienceById(workExperienceId: string, cvId: string, userId: string) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    return await prisma.workExperience.findFirst({
      where: {
        id: workExperienceId,
        cvId
      }
    });
  }

  // Cập nhật kinh nghiệm làm việc
  async updateWorkExperience(workExperienceId: string, cvId: string, userId: string, data: UpdateWorkExperienceDto) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    // Kiểm tra work experience tồn tại
    const workExperience = await this.getWorkExperienceById(workExperienceId, cvId, userId);
    if (!workExperience) {
      throw createNotFoundError('Kinh nghiệm làm việc');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.description !== undefined) updateData.description = data.description;

    return await prisma.workExperience.update({
      where: { id: workExperienceId },
      data: updateData
    });
  }

  // Xóa kinh nghiệm làm việc
  async deleteWorkExperience(workExperienceId: string, cvId: string, userId: string) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    // Kiểm tra work experience tồn tại
    const workExperience = await this.getWorkExperienceById(workExperienceId, cvId, userId);
    if (!workExperience) {
      throw createNotFoundError('Kinh nghiệm làm việc');
    }

    return await prisma.workExperience.delete({
      where: { id: workExperienceId }
    });
  }

}
