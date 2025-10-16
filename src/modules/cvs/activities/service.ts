import { prisma } from '../../../loaders/prisma.js';
import { CreateActivityDto, UpdateActivityDto } from './dto.js';

export class ActivityService {
  async createActivity(cvId: string, data: CreateActivityDto) {
    return prisma.activity.create({
      data: {
        ...data,
        cvId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }

  async getActivities(cvId: string) {
    return prisma.activity.findMany({
      where: { cvId },
      orderBy: { startDate: 'desc' },
    });
  }

  async getActivityById(cvId: string, id: string) {
    return prisma.activity.findFirst({
      where: { id, cvId },
    });
  }

  async updateActivity(cvId: string, id: string, data: UpdateActivityDto) {
    const existing = await this.getActivityById(cvId, id);
    if (!existing) {
      throw new Error('Activity not found or access denied');
    }

    return prisma.activity.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  async deleteActivity(cvId: string, id: string) {
    const existing = await this.getActivityById(cvId, id);
    if (!existing) {
      throw new Error('Activity not found or access denied');
    }

    return prisma.activity.delete({
      where: { id },
    });
  }
}
