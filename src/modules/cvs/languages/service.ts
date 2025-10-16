import { prisma } from '../../../loaders/prisma.js';
import { CreateLanguageDto, UpdateLanguageDto } from './dto.js';

export class LanguageService {
  async createLanguage(cvId: string, data: CreateLanguageDto) {
    return prisma.language.create({
      data: { ...data, cvId },
    });
  }

  async getLanguages(cvId: string) {
    return prisma.language.findMany({
      where: { cvId },
      orderBy: { language: 'asc' },
    });
  }

  async getLanguageById(cvId: string, id: string) {
    return prisma.language.findFirst({
      where: { id, cvId },
    });
  }

  async updateLanguage(cvId: string, id: string, data: UpdateLanguageDto) {
    const existing = await this.getLanguageById(cvId, id);
    if (!existing) {
      throw new Error('Language not found or access denied');
    }

    return prisma.language.update({
      where: { id },
      data,
    });
  }

  async deleteLanguage(cvId: string, id: string) {
    const existing = await this.getLanguageById(cvId, id);
    if (!existing) {
      throw new Error('Language not found or access denied');
    }

    return prisma.language.delete({
      where: { id },
    });
  }
}
