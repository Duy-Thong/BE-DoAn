import { prisma } from '../../../loaders/prisma.js';
import { CreateReferenceDto, UpdateReferenceDto } from './dto.js';

export class ReferenceService {
  async createReference(cvId: string, data: CreateReferenceDto) {
    return prisma.reference.create({
      data: {
        ...data,
        cvId,
      },
    });
  }

  async getReferences(cvId: string) {
    return prisma.reference.findMany({
      where: { cvId },
      orderBy: { name: 'asc' },
    });
  }

  async getReferenceById(cvId: string, id: string) {
    return prisma.reference.findFirst({
      where: { id, cvId },
    });
  }

  async updateReference(cvId: string, id: string, data: UpdateReferenceDto) {
    const existing = await this.getReferenceById(cvId, id);
    if (!existing) {
      throw new Error('Reference not found or access denied');
    }

    return prisma.reference.update({
      where: { id },
      data,
    });
  }

  async deleteReference(cvId: string, id: string) {
    const existing = await this.getReferenceById(cvId, id);
    if (!existing) {
      throw new Error('Reference not found or access denied');
    }

    return prisma.reference.delete({
      where: { id },
    });
  }
}
