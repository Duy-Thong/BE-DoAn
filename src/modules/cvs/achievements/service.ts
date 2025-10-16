import { prisma } from '../../../loaders/prisma.js';
import { CreateAchievementDto, UpdateAchievementDto } from './dto.js';

export class AchievementService {
  async createAchievement(cvId: string, data: CreateAchievementDto) {
    return prisma.achievement.create({
      data: {
        ...data,
        cvId,
        date: new Date(data.date),
      },
    });
  }

  async getAchievements(cvId: string) {
    return prisma.achievement.findMany({
      where: { cvId },
      orderBy: { date: 'desc' },
    });
  }

  async getAchievementById(cvId: string, id: string) {
    return prisma.achievement.findFirst({
      where: { id, cvId },
    });
  }

  async updateAchievement(cvId: string, id: string, data: UpdateAchievementDto) {
    const existing = await this.getAchievementById(cvId, id);
    if (!existing) {
      throw new Error('Achievement not found or access denied');
    }

    return prisma.achievement.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
  }

  async deleteAchievement(cvId: string, id: string) {
    const existing = await this.getAchievementById(cvId, id);
    if (!existing) {
      throw new Error('Achievement not found or access denied');
    }

    return prisma.achievement.delete({
      where: { id },
    });
  }
}
