import { prisma } from '../../loaders/prisma.js';
import { CreateJobAlertDto, UpdateJobAlertDto } from './dto.js';

export class JobAlertService {
  // Get all job alerts for user
  async getUserJobAlerts(userId: string) {
    return prisma.jobAlert.findMany({ 
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get job alert by ID
  async getJobAlertById(id: string, userId: string) {
    return prisma.jobAlert.findFirst({
      where: { 
        id,
        userId 
      }
    });
  }

  // Create new job alert
  async createJobAlert(userId: string, data: CreateJobAlertDto) {
    return prisma.jobAlert.create({
      data: {
        userId,
        keywords: data.keywords ?? null,
        location: data.location ?? null,
        type: data.type as any ?? null,
        isActive: data.isActive
      }
    });
  }

  // Update job alert
  async updateJobAlert(id: string, userId: string, data: UpdateJobAlertDto) {
    // Kiểm tra alert thuộc về user
    const existing = await prisma.jobAlert.findFirst({
      where: { 
        id,
        userId 
      }
    });

    if (!existing) {
      throw new Error('Thông báo việc làm không tìm thấy');
    }

    const updateData: any = {};
    if (data.keywords !== undefined) updateData.keywords = data.keywords ?? null;
    if (data.location !== undefined) updateData.location = data.location ?? null;
    if (data.type !== undefined) updateData.type = data.type as any;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return prisma.jobAlert.update({ 
      where: { id }, 
      data: updateData 
    });
  }

  // Delete job alert
  async deleteJobAlert(id: string, userId: string) {
    // Kiểm tra alert thuộc về user
    const existing = await prisma.jobAlert.findFirst({
      where: { 
        id,
        userId 
      }
    });

    if (!existing) {
      throw new Error('Thông báo việc làm không tìm thấy');
    }

    return prisma.jobAlert.delete({ 
      where: { id } 
    });
  }

  // Toggle job alert active status
  async toggleJobAlert(id: string, userId: string) {
    // Kiểm tra alert thuộc về user
    const existing = await prisma.jobAlert.findFirst({
      where: { 
        id,
        userId 
      }
    });

    if (!existing) {
      throw new Error('Thông báo việc làm không tìm thấy');
    }

    return prisma.jobAlert.update({
      where: { id },
      data: { isActive: !existing.isActive }
    });
  }
}
