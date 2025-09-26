import bcrypt from 'bcrypt';
import { prisma } from '../../loaders/prisma.js';
import type { CreateUserDto, UpdateUserDto } from './dto.js';

export class UsersService {
  async list() {
    return prisma.user.findMany({
      select: { id: true, email: true, fullName: true, role: true, companyId: true },
    });
  }

  async create(input: CreateUserDto) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    return prisma.user.create({
      data: {
        email: input.email,
        fullName: input.fullName,
        passwordHash,
        role: (input.role as any) || 'CANDIDATE',
        ...(input.companyId ? { company: { connect: { id: input.companyId } } } : {}),
      },
      select: { id: true, email: true, fullName: true, role: true, companyId: true },
    });
  }

  async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, fullName: true, role: true, companyId: true },
    });
  }

  async update(id: string, input: UpdateUserDto) {
    const data: any = {};
    if (input.email !== undefined) data.email = input.email;
    if (input.fullName !== undefined) data.fullName = input.fullName;
    if (input.password) data.passwordHash = await bcrypt.hash(input.password, 10);
    if (input.role !== undefined) data.role = input.role as any;
    if (input.companyId !== undefined) {
      if (input.companyId === null || input.companyId === '') {
        data.company = { disconnect: true };
      } else {
        data.company = { connect: { id: input.companyId } };
      }
    }
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, fullName: true, role: true, companyId: true },
    });
  }

  async remove(id: string) {
    await prisma.user.delete({ where: { id } });
  }
}

