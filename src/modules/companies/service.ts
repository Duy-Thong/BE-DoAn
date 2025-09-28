import { prisma } from '../../loaders/prisma.js';
import type { CreateCompanyDto, UpdateCompanyDto } from './dto.js';

export class CompaniesService {
  async list() {
    return prisma.company.findMany({ 
      where: { isActive: true },
      select: { 
        id: true, 
        name: true, 
        website: true, 
        description: true,
        logoUrl: true,
        isVerified: true,
        address: true,
        phone: true,
        email: true
      } 
    });
  }

  async create(input: CreateCompanyDto, userId: string) {
    // Tạo company
    const company = await prisma.company.create({ 
      data: { 
        name: input.name, 
        website: input.website ?? null, 
        description: input.description ?? null,
        address: input.address ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        logoUrl: input.logoUrl ?? null,
        isVerified: false, // Cần được admin xác minh
        isActive: true
      } 
    });

    // Thêm user làm OWNER của company
    await prisma.companyMember.create({
      data: {
        userId,
        companyId: company.id,
        role: 'OWNER'
      }
    });

    return company;
  }

  async getById(id: string) {
    return prisma.company.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: {
            jobs: {
              where: {
                isActive: true,
                isApproved: true
              }
            },
            members: true
          }
        }
      }
    });
  }

  async update(id: string, input: UpdateCompanyDto, userId: string) {
    // Kiểm tra quyền truy cập
    const hasPermission = await this.checkCompanyPermission(id, userId, ['OWNER', 'MANAGER']);
    if (!hasPermission) {
      throw new Error('Insufficient permissions to update company');
    }

    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.website !== undefined) data.website = input.website ?? null;
    if (input.description !== undefined) data.description = input.description ?? null;
    if (input.address !== undefined) data.address = input.address ?? null;
    if (input.phone !== undefined) data.phone = input.phone ?? null;
    if (input.email !== undefined) data.email = input.email ?? null;
    if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl ?? null;

    return prisma.company.update({ 
      where: { id }, 
      data,
      include: {
        _count: {
          select: {
            jobs: true,
            members: true
          }
        }
      }
    });
  }

  async remove(id: string, userId: string) {
    // Chỉ OWNER mới được xóa company
    const hasPermission = await this.checkCompanyPermission(id, userId, ['OWNER']);
    if (!hasPermission) {
      throw new Error('Only company owner can delete the company');
    }

    // Xóa tất cả dữ liệu liên quan
    await prisma.$transaction(async (tx) => {
      // Xóa applications
      await tx.application.deleteMany({
        where: {
          job: {
            companyId: id
          }
        }
      });

      // Xóa job views
      await tx.jobView.deleteMany({
        where: {
          job: {
            companyId: id
          }
        }
      });

      // Xóa saved jobs
      await tx.savedJob.deleteMany({
        where: {
          job: {
            companyId: id
          }
        }
      });

      // Xóa job recommendations
      await tx.jobRecommendation.deleteMany({
        where: {
          job: {
            companyId: id
          }
        }
      });

      // Xóa jobs
      await tx.job.deleteMany({
        where: { companyId: id }
      });

      // Xóa company members
      await tx.companyMember.deleteMany({
        where: { companyId: id }
      });

      // Xóa company
      await tx.company.delete({
        where: { id }
      });
    });
  }

  // Kiểm tra quyền truy cập company
  private async checkCompanyPermission(companyId: string, userId: string, requiredRoles: any[]) {
    const member = await prisma.companyMember.findFirst({
      where: {
        userId,
        companyId,
        role: { in: requiredRoles }
      }
    });

    return !!member;
  }

  // Lấy danh sách companies của user
  async getUserCompanies(userId: string) {
    const memberships = await prisma.companyMember.findMany({
      where: { userId },
      include: {
        company: {
          include: {
            _count: {
              select: {
                jobs: {
                  where: {
                    isActive: true,
                    isApproved: true
                  }
                },
                members: true
              }
            }
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    return memberships.map(membership => ({
      ...membership.company,
      userRole: membership.role,
      joinedAt: membership.joinedAt
    }));
  }
}

