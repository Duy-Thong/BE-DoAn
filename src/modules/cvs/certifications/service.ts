import { prisma } from '../../../loaders/prisma.js';
import { CreateCertificationDto, UpdateCertificationDto } from './dto.js';
import { BaseCVService } from '../base-cv-service.js';
import { createNotFoundError } from '../../../utils/error.js';

export class CertificationService extends BaseCVService {
  async createCertification(cvId: string, userId: string, data: CreateCertificationDto) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    return prisma.certification.create({
      data: {
        ...data,
        cvId,
        issueDate: new Date(data.issueDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });
  }

  async getCertifications(cvId: string, userId: string) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    return prisma.certification.findMany({
      where: { cvId },
      orderBy: { issueDate: 'desc' },
    });
  }

  async getCertificationById(cvId: string, id: string, userId: string) {
    // Kiểm tra CV thuộc về user
    await this.verifyCVOwnership(cvId, userId);

    return prisma.certification.findFirst({
      where: { id, cvId },
    });
  }

  async updateCertification(cvId: string, id: string, userId: string, data: UpdateCertificationDto) {
    const existing = await this.getCertificationById(cvId, id, userId);
    if (!existing) {
      throw createNotFoundError('Chứng chỉ');
    }

    return prisma.certification.update({
      where: { id },
      data: {
        ...data,
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
    });
  }

  async deleteCertification(cvId: string, id: string, userId: string) {
    const existing = await this.getCertificationById(cvId, id, userId);
    if (!existing) {
      throw createNotFoundError('Chứng chỉ');
    }

    return prisma.certification.delete({
      where: { id },
    });
  }
}
