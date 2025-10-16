import bcrypt from 'bcrypt';
import { prisma } from '../../loaders/prisma.js';
import type { CreateUserDto, UpdateUserDto } from './dto.js';

export class UsersService {
  async list() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        dateOfBirth: true,
        gender: true,
        nationality: true,
        role: true,
        isActive: true,
        isLocked: true,
        isEmailVerified: true,
        lastLoginAt: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(input: CreateUserDto) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    return prisma.user.create({
      data: {
        email: input.email,
        fullName: input.fullName,
        passwordHash,
        phoneNumber: input.phoneNumber,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        gender: input.gender as any,
        nationality: input.nationality,
        role: (input.role as any) || 'CANDIDATE',
        avatarUrl: input.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        dateOfBirth: true,
        gender: true,
        nationality: true,
        role: true,
        isActive: true,
        isLocked: true,
        isEmailVerified: true,
        lastLoginAt: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        dateOfBirth: true,
        gender: true,
        nationality: true,
        role: true,
        isActive: true,
        isLocked: true,
        isEmailVerified: true,
        lastLoginAt: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, input: UpdateUserDto) {
    const data: any = {};
    if (input.email !== undefined) data.email = input.email;
    if (input.fullName !== undefined) data.fullName = input.fullName;
    if (input.phoneNumber !== undefined) data.phoneNumber = input.phoneNumber;
    if (input.dateOfBirth !== undefined) data.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null;
    if (input.gender !== undefined) data.gender = input.gender as any;
    if (input.nationality !== undefined) data.nationality = input.nationality;
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
    if (input.password) data.passwordHash = await bcrypt.hash(input.password, 10);
    if (input.role !== undefined) data.role = input.role as any;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.isLocked !== undefined) data.isLocked = input.isLocked;
    if (input.isEmailVerified !== undefined) data.isEmailVerified = input.isEmailVerified;

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        dateOfBirth: true,
        gender: true,
        nationality: true,
        role: true,
        isActive: true,
        isLocked: true,
        isEmailVerified: true,
        lastLoginAt: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await prisma.user.delete({ where: { id } });
  }

  async updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }
}

