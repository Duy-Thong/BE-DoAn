import { prisma } from '../../../loaders/prisma.js';
import { CreateCompanySocialMediaDto, UpdateCompanySocialMediaDto } from './dto.js';
import { createNotFoundError } from '../../../utils/error.js';

export class CompanySocialMediaService {
  async createCompanySocialMedia(companyId: string, data: CreateCompanySocialMediaDto) {
    // Verify company exists
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw createNotFoundError('Công ty');
    }

    return prisma.socialMedia.create({
      data: {
        ...data,
        ownerType: 'COMPANY',
        ownerId: companyId,
      },
    });
  }

  async getCompanySocialMedias(companyId: string) {
    // Verify company exists
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw createNotFoundError('Công ty');
    }

    return prisma.socialMedia.findMany({
      where: {
        ownerType: 'COMPANY',
        ownerId: companyId
      },
      orderBy: { platform: 'asc' },
    });
  }

  async getCompanySocialMediaById(companyId: string, id: string) {
    return prisma.socialMedia.findFirst({
      where: {
        id,
        ownerType: 'COMPANY',
        ownerId: companyId
      },
    });
  }

  async updateCompanySocialMedia(companyId: string, id: string, data: UpdateCompanySocialMediaDto) {
    const existing = await this.getCompanySocialMediaById(companyId, id);
    if (!existing) {
      throw createNotFoundError('Mạng xã hội');
    }

    return prisma.socialMedia.update({
      where: { id },
      data,
    });
  }

  async deleteCompanySocialMedia(companyId: string, id: string) {
    const existing = await this.getCompanySocialMediaById(companyId, id);
    if (!existing) {
      throw createNotFoundError('Mạng xã hội');
    }

    return prisma.socialMedia.delete({
      where: { id },
    });
  }
}
