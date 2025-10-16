import { prisma } from '../../../loaders/prisma.js';
import { CreateSocialMediaDto, UpdateSocialMediaDto } from './dto.js';

export class SocialMediaService {
  async createSocialMedia(cvId: string, data: CreateSocialMediaDto) {
    return prisma.socialMedia.create({
      data: {
        ...data,
        ownerType: 'CV',
        ownerId: cvId,
      },
    });
  }

  async getSocialMedias(cvId: string) {
    return prisma.socialMedia.findMany({
      where: { 
        ownerType: 'CV',
        ownerId: cvId 
      },
      orderBy: { platform: 'asc' },
    });
  }

  async getSocialMediaById(cvId: string, id: string) {
    return prisma.socialMedia.findFirst({
      where: { 
        id, 
        ownerType: 'CV',
        ownerId: cvId 
      },
    });
  }

  async updateSocialMedia(cvId: string, id: string, data: UpdateSocialMediaDto) {
    const existing = await this.getSocialMediaById(cvId, id);
    if (!existing) {
      throw new Error('SocialMedia not found or access denied');
    }

    return prisma.socialMedia.update({
      where: { id },
      data,
    });
  }

  async deleteSocialMedia(cvId: string, id: string) {
    const existing = await this.getSocialMediaById(cvId, id);
    if (!existing) {
      throw new Error('SocialMedia not found or access denied');
    }

    return prisma.socialMedia.delete({
      where: { id },
    });
  }
}
