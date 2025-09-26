import { prisma } from '../../loaders/prisma.js';
import type { UpsertProfileDto } from './dto.js';

export class ProfilesService {
  async get(userId: string) {
    return prisma.profile.findUnique({ where: { userId } });
  }

  async upsert(userId: string, input: UpsertProfileDto) {
    const data: any = {};
    if (input.headline !== undefined) data.headline = input.headline ?? null;
    if (input.location !== undefined) data.location = input.location ?? null;
    if (input.experience !== undefined) data.experience = input.experience ?? null;
    if (input.education !== undefined) data.education = input.education ?? null;
    if (input.skills !== undefined) data.skills = input.skills ?? null;
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl ?? null;
    return prisma.profile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }
}

