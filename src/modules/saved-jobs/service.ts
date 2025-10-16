import { prisma } from '../../loaders/prisma.js';
import { CreateSavedJobDto, UpdateSavedJobDto } from './dto.js';

export class SavedJobService {
  async createSavedJob(userId: string, data: CreateSavedJobDto) {
    // Check if job is already saved
    const existing = await prisma.savedJob.findFirst({
      where: {
        userId,
        jobId: data.jobId,
      },
    });

    if (existing) {
      throw new Error('Công việc đã được lưu rồi');
    }

    return prisma.savedJob.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getSavedJobs(userId: string, options: {
    page?: number;
    limit?: number;
  } = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [savedJobs, total] = await Promise.all([
      prisma.savedJob.findMany({
        where: { userId },
        include: {
          job: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.savedJob.count({ where: { userId } }),
    ]);

    return {
      savedJobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getSavedJobById(userId: string, id: string) {
    return prisma.savedJob.findFirst({
      where: { id, userId },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteSavedJob(userId: string, id: string) {
    const existing = await prisma.savedJob.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Saved job not found or access denied');
    }

    return prisma.savedJob.delete({
      where: { id },
    });
  }

  async deleteSavedJobByJobId(userId: string, jobId: string) {
    const existing = await prisma.savedJob.findFirst({
      where: { userId, jobId },
    });

    if (!existing) {
      throw new Error('Saved job not found or access denied');
    }

    return prisma.savedJob.delete({
      where: { id: existing.id },
    });
  }

  async isJobSaved(userId: string, jobId: string) {
    const savedJob = await prisma.savedJob.findFirst({
      where: { userId, jobId },
    });

    return !!savedJob;
  }

  async getSavedJobCount(userId: string) {
    return prisma.savedJob.count({
      where: { userId },
    });
  }

  async getSavedJobsByJobIds(userId: string, jobIds: string[]) {
    return prisma.savedJob.findMany({
      where: {
        userId,
        jobId: { in: jobIds },
      },
      select: {
        jobId: true,
        createdAt: true,
      },
    });
  }
}
