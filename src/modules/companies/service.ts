import { prisma } from '../../loaders/prisma.js';
import type { CreateCompanyDto, UpdateCompanyDto } from './dto.js';

export class CompaniesService {
  async list() {
    return prisma.company.findMany({ select: { id: true, name: true, website: true, description: true } });
  }

  async create(input: CreateCompanyDto) {
    return prisma.company.create({ data: { name: input.name, website: input.website ?? null, description: input.description ?? null } });
  }

  async getById(id: string) {
    return prisma.company.findUnique({ where: { id } });
  }

  async update(id: string, input: UpdateCompanyDto) {
    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.website !== undefined) data.website = input.website ?? null;
    if (input.description !== undefined) data.description = input.description ?? null;
    return prisma.company.update({ where: { id }, data });
  }

  async remove(id: string) {
    await prisma.company.delete({ where: { id } });
  }
}

