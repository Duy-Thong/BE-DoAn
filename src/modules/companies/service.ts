import { Prisma, CompanyRole } from '../../generated/prisma/index.js';
import { prisma } from '../../loaders/prisma.js';
import { AppError, createNotFoundError, createConflictError } from '../../utils/error.js';
import type { CreateCompanyDto, UpdateCompanyDto, CompanyQueryDto } from './dto.js';

export class CompaniesService {
  // List companies with pagination and filtering
  async list(query: CompanyQueryDto) {
    const { page, limit, search, industry, companySize, isVerified, isActive, isEmailVerified, sortBy, sortOrder } =
      query;

    const where: Prisma.CompanyWhereInput = {};

    // Apply filters
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (industry !== undefined) where.industry = { contains: industry, mode: 'insensitive' };
    if (companySize !== undefined) where.companySize = companySize;
    if (isVerified !== undefined) where.isVerified = isVerified;
    if (isActive !== undefined) where.isActive = isActive;
    if (isEmailVerified !== undefined) where.isEmailVerified = isEmailVerified;

    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
        bannerUrl: true,
          isVerified: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              jobs: true,
              users: true,
            },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return {
      data: companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Create a new company
  async create(input: CreateCompanyDto) {
    const company = await prisma.company.create({
      data: {
        name: input.name,
        website: input.website,
        description: input.description,
        industry: input.industry,
        companySize: input.companySize,
        foundedYear: input.foundedYear,
        address: input.address,
        phone: input.phone,
        email: input.email,
        logoUrl: input.logoUrl,
      },
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
        bannerUrl: true,
        isVerified: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return company;
  }

  // Get company by ID
  async getById(id: string) {
    const company = await prisma.company.findUnique({
      where: { id },
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
        bannerUrl: true,
        isVerified: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            jobs: true,
            users: true,
          },
        },
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            companyRole: true,
            joinedAt: true,
          },
          take: 10,
        },
      },
    });

    if (!company) {
      throw createNotFoundError('Công ty');
    }

    return company;
  }

  // Update company
  async update(id: string, input: UpdateCompanyDto) {
    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id },
    });

    if (!existingCompany) {
      throw new AppError('Công ty không tồn tại', 404);
    }

    const data: Prisma.CompanyUpdateInput = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.website !== undefined) data.website = input.website;
    if (input.description !== undefined) data.description = input.description;
    if (input.industry !== undefined) data.industry = input.industry;
    if (input.companySize !== undefined) data.companySize = input.companySize;
    if (input.foundedYear !== undefined) data.foundedYear = input.foundedYear;
    if (input.address !== undefined) data.address = input.address;
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.email !== undefined) data.email = input.email;
    if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl;
    if (input.bannerUrl !== undefined) data.bannerUrl = input.bannerUrl;
    if (input.isVerified !== undefined) data.isVerified = input.isVerified;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.isEmailVerified !== undefined) data.isEmailVerified = input.isEmailVerified;

    const company = await prisma.company.update({
      where: { id },
      data,
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
        bannerUrl: true,
        isVerified: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return company;
  }

  // Delete company
  async remove(id: string) {
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw createNotFoundError('Công ty');
    }

    await prisma.company.delete({
      where: { id },
    });

    return { message: 'Xóa công ty thành công' };
  }

  // Additional methods
  async verifyCompany(id: string) {
    return this.update(id, { isVerified: true });
  }

  async unverifyCompany(id: string) {
    return this.update(id, { isVerified: false });
  }

  async activateCompany(id: string) {
    return this.update(id, { isActive: true });
  }

  async deactivateCompany(id: string) {
    return this.update(id, { isActive: false });
  }

  // Get company's jobs
  async getCompanyJobs(id: string, page = 1, limit = 10) {
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw createNotFoundError('Công ty');
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: { companyId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          industry: true,
          experienceLevel: true,
          type: true,
          salary: true,
          urgent: true,
          isActive: true,
          expiresAt: true,
          applicationCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.job.count({ where: { companyId: id } }),
    ]);

    return {
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get company's users/members
  async getCompanyUsers(id: string, page = 1, limit = 10) {
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw createNotFoundError('Công ty');
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { companyId: id },
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          companyRole: true,
          joinedAt: true,
          isActive: true,
        },
      }),
      prisma.user.count({ where: { companyId: id } }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Assign user to company
  async assignUser(companyId: string, userId: string, companyRole: CompanyRole = CompanyRole.VIEWER) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw createNotFoundError('Công ty');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw createNotFoundError('Người dùng');
    }

    if (user.companyId) {
      throw createConflictError('Người dùng đã thuộc về một công ty khác');
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        companyId,
        companyRole,
        joinedAt: new Date(),
      },
    });
  }

  // Remove user from company
  async removeUser(companyId: string, userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.companyId !== companyId) {
      throw createConflictError('Người dùng không thuộc về công ty này');
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        companyId: null,
        companyRole:CompanyRole.VIEWER,
        joinedAt: null,
      },
    });
  }

  // Update user role in company
  async updateUserRole(companyId: string, userId: string, companyRole: CompanyRole) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.companyId !== companyId) {
      throw createConflictError('Người dùng không thuộc về công ty này');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { companyRole },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        companyRole: true,
        joinedAt: true,
        isActive: true,
      },
    });
  }
}

