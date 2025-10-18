import { prisma } from '../../loaders/prisma.js';
import { CreateCVDto, UpdateCVDto, SetMainCVDto } from './dto.js';
import { createNotFoundError, createAuthError } from '../../utils/error.js';

export class CVService {
  // Tạo CV mới
  async createCV(userId: string, data: CreateCVDto) {
    // Nếu đây là CV đầu tiên, tự động đặt làm CV chính
    const existingCVs = await prisma.cV.count({
      where: { userId }
    });

    const cv = await prisma.cV.create({
      data: {
        title: data.title,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender as any,
        nationality: data.nationality,
        address: data.address,
        avatarUrl: data.avatarUrl,
        currentPosition: data.currentPosition,
        summary: data.summary,
        objective: data.objective,
        userId,
        isMain: existingCVs === 0 || data.isMain, // CV đầu tiên sẽ là CV chính
        embedding: [], // TODO: Generate embedding using AI service
      },
    });

    return cv;
  }

  // Lấy danh sách CV của user
  async getUserCVs(userId: string) {
    return await prisma.cV.findMany({
      where: { userId },
      orderBy: [
        { isMain: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  // Lấy CV theo ID
  async getCVById(cvId: string, userId: string) {
    return await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId
      }
    });
  }

  // Cập nhật CV
  async updateCV(cvId: string, userId: string, data: UpdateCVDto) {
    // Kiểm tra quyền sở hữu
    const existingCV = await this.getCVById(cvId, userId);
    if (!existingCV) {
      throw createNotFoundError('CV');
    }

    // Nếu đặt làm CV chính, bỏ CV chính cũ
    if (data.isMain) {
      await prisma.cV.updateMany({
        where: { userId, isMain: true },
        data: { isMain: false }
      });
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    if (data.gender !== undefined) updateData.gender = data.gender as any;
    if (data.nationality !== undefined) updateData.nationality = data.nationality;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.currentPosition !== undefined) updateData.currentPosition = data.currentPosition;
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.objective !== undefined) updateData.objective = data.objective;
    if (data.isMain !== undefined) updateData.isMain = data.isMain;

    return await prisma.cV.update({
      where: { id: cvId },
      data: updateData
    });
  }

  // Đặt CV làm CV chính
  async setMainCV(userId: string, data: SetMainCVDto) {
    // Kiểm tra CV có tồn tại và thuộc về user
    const cv = await this.getCVById(data.cvId, userId);
    if (!cv) {
      throw createNotFoundError('CV');
    }

    // Bỏ CV chính cũ
    await prisma.cV.updateMany({
      where: { userId, isMain: true },
      data: { isMain: false }
    });

    // Đặt CV mới làm chính
    return await prisma.cV.update({
      where: { id: data.cvId },
      data: { isMain: true }
    });
  }

  // Xóa CV
  async deleteCV(cvId: string, userId: string) {
    // Kiểm tra quyền sở hữu
    const cv = await this.getCVById(cvId, userId);
    if (!cv) {
      throw createNotFoundError('CV');
    }

    // Nếu đây là CV chính, đặt CV khác làm chính (nếu có)
    if (cv.isMain) {
      const otherCVs = await prisma.cV.findMany({
        where: { userId, id: { not: cvId } },
        orderBy: { createdAt: 'desc' },
        take: 1
      });

      if (otherCVs.length > 0) {
        await prisma.cV.update({
          where: { id: otherCVs[0].id },
          data: { isMain: true }
        });
      }
    }

    return await prisma.cV.delete({
      where: { id: cvId }
    });
  }

  // Lấy CV chính của user
  async getMainCV(userId: string) {
    return await prisma.cV.findFirst({
      where: { userId, isMain: true }
    });
  }

  // Generate CV embedding (for AI recommendations)
  async generateEmbedding(cvId: string, userId: string) {
    const cv = await this.getCVById(cvId, userId);
    if (!cv) {
      throw createNotFoundError('CV');
    }

    // TODO: Call AI service to generate embedding
    // For now, return empty array
    const embedding: number[] = [];
    
    return await prisma.cV.update({
      where: { id: cvId },
      data: { 
        embedding,
        lastGeneratedAt: new Date()
      }
    });
  }

  // Get CV with all related data
  async getCVWithDetails(cvId: string, userId: string) {
    const cv = await this.getCVById(cvId, userId);
    if (!cv) {
      throw createNotFoundError('CV');
    }

    return await prisma.cV.findUnique({
      where: { id: cvId },
      include: {
        workExperience: true,
        education: true,
        languages: true,
        certifications: true,
        projects: true,
        achievements: true,
        references: true,
        skills: true,
        activities: true,
        socialMedia: {
          where: {
            ownerType: 'CV',
            ownerId: cvId
          }
        }
      }
    });
  }

  // Download CV (get full CV data for export)
  async downloadCV(cvId: string, userId: string) {
    return await this.getCVWithDetails(cvId, userId);
  }
}
