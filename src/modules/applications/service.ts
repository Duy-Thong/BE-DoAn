import { prisma } from '../../loaders/prisma.js';
import type { CreateApplicationDto } from './dto.js';

export class ApplicationsService {
  async list() {
    return prisma.application.findMany({ select: { id: true, status: true, userId: true, jobId: true, cvUrl: true, coverLetter: true } });
  }

  async create(userId: string, input: CreateApplicationDto) {
    return prisma.application.create({ data: { userId, jobId: input.jobId, cvUrl: input.cvUrl ?? null, coverLetter: input.coverLetter ?? null } });
  }

  async updateStatus(id: string, status: 'PENDING' | 'REVIEWING' | 'INTERVIEW' | 'OFFER' | 'REJECTED') {
    return prisma.application.update({ where: { id }, data: { status } });
  }
}

