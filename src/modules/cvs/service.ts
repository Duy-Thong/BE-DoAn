import { PrismaClient } from '../../generated/prisma/index.js';
import { CreateCVDto, UpdateCVDto, SetMainCVDto } from './dto.js';

const prisma = new PrismaClient();

export class CVService {
  // Tạo CV mới
  async createCV(userId: string, data: CreateCVDto) {
    // Nếu đây là CV đầu tiên, tự động đặt làm CV chính
    const existingCVs = await prisma.cV.count({
      where: { userId }
    });

    const cv = await prisma.cV.create({
      data: {
        ...data,
        userId,
        isMain: existingCVs === 0, // CV đầu tiên sẽ là CV chính
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
      throw new Error('CV not found or access denied');
    }

    // Nếu đặt làm CV chính, bỏ CV chính cũ
    if (data.isMain) {
      await prisma.cV.updateMany({
        where: { userId, isMain: true },
        data: { isMain: false }
      });
    }

    return await prisma.cV.update({
      where: { id: cvId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  // Đặt CV làm CV chính
  async setMainCV(userId: string, data: SetMainCVDto) {
    // Kiểm tra CV có tồn tại và thuộc về user
    const cv = await this.getCVById(data.cvId, userId);
    if (!cv) {
      throw new Error('CV not found or access denied');
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
      throw new Error('CV not found or access denied');
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

  // Download CV (trả về thông tin file)
  async downloadCV(cvId: string, userId: string) {
    const cv = await this.getCVById(cvId, userId);
    if (!cv) {
      throw new Error('CV not found or access denied');
    }

    return {
      fileName: cv.fileName,
      fileUrl: cv.fileUrl,
      fileSize: cv.fileSize
    };
  }
}
