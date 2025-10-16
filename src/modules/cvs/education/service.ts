import { prisma } from '../../../loaders/prisma.js';
import { CreateEducationDto, UpdateEducationDto } from './dto.js';

export class EducationService {
  async createEducation(cvId: string, data: CreateEducationDto) {
    return prisma.education.create({
      data: {
        ...data,
        cvId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }

  async getEducations(cvId: string) {
    return prisma.education.findMany({
      where: { cvId },
      orderBy: { startDate: 'desc' },
    });
  }

  async getEducationById(cvId: string, id: string) {
    return prisma.education.findFirst({
      where: { id, cvId },
    });
  }

  async updateEducation(cvId: string, id: string, data: UpdateEducationDto) {
    const existing = await this.getEducationById(cvId, id);
    if (!existing) {
      throw new Error('Education not found or access denied');
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

  async deleteEducation(cvId: string, id: string) {
    const existing = await this.getEducationById(cvId, id);
    if (!existing) {
      throw new Error('Education not found or access denied');
    }

    return prisma.education.delete({
      where: { id },
    });
  }
}
