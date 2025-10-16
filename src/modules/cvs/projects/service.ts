import { prisma } from '../../../loaders/prisma.js';
import { CreateProjectDto, UpdateProjectDto } from './dto.js';

export class ProjectService {
  async createProject(cvId: string, data: CreateProjectDto) {
    return prisma.project.create({
      data: {
        ...data,
        cvId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }

  async getProjects(cvId: string) {
    return prisma.project.findMany({
      where: { cvId },
      orderBy: { startDate: 'desc' },
    });
  }

  async getProjectById(cvId: string, id: string) {
    return prisma.project.findFirst({
      where: { id, cvId },
    });
  }

  async updateProject(cvId: string, id: string, data: UpdateProjectDto) {
    const existing = await this.getProjectById(cvId, id);
    if (!existing) {
      throw new Error('Project not found or access denied');
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

  async deleteProject(cvId: string, id: string) {
    const existing = await this.getProjectById(cvId, id);
    if (!existing) {
      throw new Error('Project not found or access denied');
    }

    return prisma.project.delete({
      where: { id },
    });
  }
}
