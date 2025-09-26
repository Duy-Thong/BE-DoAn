import { prisma } from '../../loaders/prisma.js';
import type { CreateJobDto, UpdateJobDto } from './dto.js';

export class JobsService {
  async list() {
    return prisma.job.findMany({ where: { isActive: true }, select: { id: true, title: true, description: true, location: true, type: true, companyId: true } });
  }

  async create(input: CreateJobDto) {
    return prisma.job.create({ data: { title: input.title, description: input.description, location: input.location ?? null, type: (input.type as any) || 'FULL_TIME', companyId: input.companyId } });
  }

  async getById(id: string) {
    return prisma.job.findUnique({ where: { id } });
  }

  async update(id: string, input: UpdateJobDto) {
    const data: any = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.location !== undefined) data.location = input.location ?? null;
    if (input.type !== undefined) data.type = input.type as any;
    return prisma.job.update({ where: { id }, data });
  }

  async remove(id: string) {
    await prisma.job.delete({ where: { id } });
  }
}

