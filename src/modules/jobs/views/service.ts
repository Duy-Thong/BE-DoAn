import { prisma } from '../../../loaders/prisma.js';
import { CreateJobViewDto, UpdateJobViewDto } from './dto.js';

export class JobViewService {
  async createJobView(data: CreateJobViewDto) {
    // Check if view already exists
    const existingView = await prisma.jobView.findFirst({
      where: {
        userId: data.userId,
        jobId: data.jobId,
      },
    });

    if (existingView) {
      // Update existing view timestamp
      return prisma.jobView.update({
        where: { id: existingView.id },
        data: {
          viewedAt: new Date(),
        },
      });
    }

    // Create new view
    return prisma.jobView.create({
      data: {
        ...data,
        viewedAt: data.viewedAt ? new Date(data.viewedAt) : new Date(),
      },
    });
  }

  async getJobViews(jobId: string) {
    return prisma.jobView.findMany({
      where: { jobId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
    });
  }

  async getJobViewById(jobId: string, id: string) {
    return prisma.jobView.findFirst({
      where: { id, jobId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async getUserJobViews(userId: string) {
    return prisma.jobView.findMany({
      where: { userId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
    });
  }

  async getJobViewStats(jobId: string) {
    const totalViews = await prisma.jobView.count({
      where: { jobId },
    });

    const uniqueViews = await prisma.jobView.groupBy({
      by: ['userId'],
      where: { jobId },
    });

    const recentViews = await prisma.jobView.count({
      where: {
        jobId,
        viewedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    return {
      totalViews,
      uniqueViews: uniqueViews.length,
      recentViews,
    };
  }

  async deleteJobView(jobId: string, id: string) {
    const existing = await this.getJobViewById(jobId, id);
    if (!existing) {
      throw new Error('JobView not found or access denied');
    }

    return prisma.jobView.delete({
      where: { id },
    });
  }

  async deleteUserJobViews(userId: string, jobId: string) {
    return prisma.jobView.deleteMany({
      where: { userId, jobId },
    });
  }

  async getPopularJobs(limit: number = 10) {
    const popularJobs = await prisma.jobView.groupBy({
      by: ['jobId'],
      _count: {
        jobId: true,
      },
      orderBy: {
        _count: {
          jobId: 'desc',
        },
      },
      take: limit,
    });

    const jobIds = popularJobs.map(item => item.jobId);
    
    return prisma.job.findMany({
      where: {
        id: {
          in: jobIds,
        },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        _count: {
          select: {
            views: true,
          },
        },
      },
    });
  }
}
