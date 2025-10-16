import { prisma } from '../../loaders/prisma.js';
import type { CreateCompanyDto, UpdateCompanyDto, CreateSocialMediaDto, UpdateSocialMediaDto } from './dto.js';

export class CompaniesService {
  async list() {
    return prisma.company.findMany({ 
      where: { isActive: true },
      select: { 
        id: true, 
        name: true, 
        website: true, 
        description: true,
        industry: true,
        companySize: true,
        foundedYear: true,
        address: true,
        phone: true,
        email: true,
        logoUrl: true,
        isVerified: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true
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
        industry: input.industry ?? null,
        companySize: input.companySize as any ?? null,
        foundedYear: input.foundedYear ?? null,
        address: input.address ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        logoUrl: input.logoUrl ?? null,
        isVerified: false, // Cần được admin xác minh
        isActive: true,
        isEmailVerified: false
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
    if (input.industry !== undefined) data.industry = input.industry ?? null;
    if (input.companySize !== undefined) data.companySize = input.companySize as any ?? null;
    if (input.foundedYear !== undefined) data.foundedYear = input.foundedYear ?? null;
    if (input.address !== undefined) data.address = input.address ?? null;
    if (input.phone !== undefined) data.phone = input.phone ?? null;
    if (input.email !== undefined) data.email = input.email ?? null;
    if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl ?? null;
    if (input.isVerified !== undefined) data.isVerified = input.isVerified;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.isEmailVerified !== undefined) data.isEmailVerified = input.isEmailVerified;

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

      // Xóa social media
      await tx.socialMedia.deleteMany({
        where: {
          ownerType: 'Company',
          ownerId: id
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

  // Social Media Management
  async getSocialMedia(companyId: string) {
    return prisma.socialMedia.findMany({
      where: {
        ownerType: 'Company',
        ownerId: companyId
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async createSocialMedia(companyId: string, userId: string, input: CreateSocialMediaDto) {
    // Check permission
    const hasPermission = await this.checkCompanyPermission(companyId, userId, ['OWNER', 'MANAGER', 'RECRUITER']);
    if (!hasPermission) {
      throw new Error('Insufficient permissions to manage social media');
    }

    return prisma.socialMedia.create({
      data: {
        platform: input.platform,
        url: input.url,
        isVerified: input.isVerified,
        ownerType: 'Company',
        ownerId: companyId
      }
    });
  }

  async updateSocialMedia(companyId: string, userId: string, socialMediaId: string, input: UpdateSocialMediaDto) {
    // Check permission
    const hasPermission = await this.checkCompanyPermission(companyId, userId, ['OWNER', 'MANAGER', 'RECRUITER']);
    if (!hasPermission) {
      throw new Error('Insufficient permissions to manage social media');
    }

    // Verify social media belongs to company
    const socialMedia = await prisma.socialMedia.findFirst({
      where: {
        id: socialMediaId,
        ownerType: 'Company',
        ownerId: companyId
      }
    });

    if (!socialMedia) {
      throw new Error('Social media not found or access denied');
    }

    return prisma.socialMedia.update({
      where: { id: socialMediaId },
      data: input
    });
  }

  async deleteSocialMedia(companyId: string, userId: string, socialMediaId: string) {
    // Check permission
    const hasPermission = await this.checkCompanyPermission(companyId, userId, ['OWNER', 'MANAGER', 'RECRUITER']);
    if (!hasPermission) {
      throw new Error('Insufficient permissions to manage social media');
    }

    // Verify social media belongs to company
    const socialMedia = await prisma.socialMedia.findFirst({
      where: {
        id: socialMediaId,
        ownerType: 'Company',
        ownerId: companyId
      }
    });

    if (!socialMedia) {
      throw new Error('Social media not found or access denied');
    }

    return prisma.socialMedia.delete({
      where: { id: socialMediaId }
    });
  }
}

