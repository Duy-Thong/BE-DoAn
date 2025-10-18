import { prisma } from '../../../loaders/prisma.js';
import { CreateProjectDto, UpdateProjectDto } from './dto.js';
import { BaseCVService } from '../base-cv-service.js';
import { createNotFoundError } from '../../../utils/error.js';

export class ProjectService extends BaseCVService {
  async createProject(cvId: string, userId: string, data: CreateProjectDto) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    return prisma.project.create({
      data: {
        ...data,
        cvId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }

  async getProjects(cvId: string, userId: string) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    return prisma.project.findMany({
      where: { cvId },
      orderBy: { startDate: 'desc' },
    });
  }

  async getProjectById(cvId: string, id: string, userId: string) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    return prisma.project.findFirst({
      where: { id, cvId },
    });
  }

  async updateProject(cvId: string, id: string, userId: string, data: UpdateProjectDto) {
    const existing = await this.getProjectById(cvId, id, userId);
    if (!existing) {
      throw createNotFoundError('Dự án');
    }

    return prisma.project.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  async deleteProject(cvId: string, id: string, userId: string) {
    const existing = await this.getProjectById(cvId, id, userId);
    if (!existing) {
      throw createNotFoundError('Dự án');
    }

    return prisma.project.delete({
      where: { id },
    });
  }
}
