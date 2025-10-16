import { prisma } from '../../../loaders/prisma.js';
import { CreateCertificationDto, UpdateCertificationDto } from './dto.js';

export class CertificationService {
  async createCertification(cvId: string, data: CreateCertificationDto) {
    return prisma.certification.create({
      data: {
        ...data,
        cvId,
        issueDate: new Date(data.issueDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });
  }

  async getCertifications(cvId: string) {
    return prisma.certification.findMany({
      where: { cvId },
      orderBy: { issueDate: 'desc' },
    });
  }

  async getCertificationById(cvId: string, id: string) {
    return prisma.certification.findFirst({
      where: { id, cvId },
    });
  }

  async updateCertification(cvId: string, id: string, data: UpdateCertificationDto) {
    const existing = await this.getCertificationById(cvId, id);
    if (!existing) {
      throw new Error('Certification not found or access denied');
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

  async deleteCertification(cvId: string, id: string) {
    const existing = await this.getCertificationById(cvId, id);
    if (!existing) {
      throw new Error('Certification not found or access denied');
    }

    return prisma.certification.delete({
      where: { id },
    });
  }
}
