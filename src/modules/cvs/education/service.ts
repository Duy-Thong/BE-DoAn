import { prisma } from '../../../loaders/prisma.js';
import { CreateEducationDto, UpdateEducationDto } from './dto.js';
import { BaseCVService } from '../base-cv-service.js';
import { createNotFoundError } from '../../../utils/error.js';

export class EducationService extends BaseCVService {
  async createEducation(cvId: string, userId: string, data: CreateEducationDto) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    return prisma.education.create({
      data: {
        ...data,
        cvId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }

  async getEducations(cvId: string, userId: string) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    return prisma.education.findMany({
      where: { cvId },
      orderBy: { startDate: 'desc' },
    });
  }

  async getEducationById(cvId: string, id: string, userId: string) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    return prisma.education.findFirst({
      where: { id, cvId },
    });
  }

  async updateEducation(cvId: string, id: string, userId: string, data: UpdateEducationDto) {
    const existing = await this.getEducationById(cvId, id, userId);
    if (!existing) {
      throw createNotFoundError('Học vấn');
    }

    return prisma.education.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  async deleteEducation(cvId: string, id: string, userId: string) {
    const existing = await this.getEducationById(cvId, id, userId);
    if (!existing) {
      throw createNotFoundError('Học vấn');
    }

    return prisma.education.delete({
      where: { id },
    });
  }
}
