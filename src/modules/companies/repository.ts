import { Prisma, CompanyRole } from '../../generated/prisma/index.js';
import { prisma } from '../../loaders/prisma.js';
import { createNotFoundError, createConflictError } from '../../utils/error.js';
import type { CreateCompanyDto, UpdateCompanyDto, CompanyQueryDto } from './dto.js';

/**
 * Company Repository
 * Handles all data access operations for companies
 * Pure data access layer - no business logic, no validation
 */
export class CompanyRepository {
  // ========================================
  // COMPANY CRUD OPERATIONS
  // ========================================

  /**
   * Find many companies with pagination and filtering
   */
  async findMany(query: CompanyQueryDto) {
    const { page, limit, search, industry, companySize, isVerified, isActive, isEmailVerified, sortBy, sortOrder } = query;

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

  /**
   * Find company by ID
   */
  async findById(id: string) {
    return prisma.company.findUnique({
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
  }

  /**
   * Create new company
   */
  async create(input: CreateCompanyDto) {
    return prisma.company.create({
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
        bannerUrl: input.bannerUrl,
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
  }

  /**
   * Update company
   */
  async update(id: string, input: UpdateCompanyDto) {
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

    return prisma.company.update({
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
  }

  /**
   * Delete company
   */
  async delete(id: string) {
    return prisma.company.delete({
      where: { id },
    });
  }

  // ========================================
  // COMPANY STATUS OPERATIONS
  // ========================================

  /**
   * Verify company
   */
  async verify(id: string) {
    return this.update(id, { isVerified: true });
  }

  /**
   * Unverify company
   */
  async unverify(id: string) {
    return this.update(id, { isVerified: false });
  }

  /**
   * Activate company
   */
  async activate(id: string) {
    return this.update(id, { isActive: true });
  }

  /**
   * Deactivate company
   */
  async deactivate(id: string) {
    return this.update(id, { isActive: false });
  }

  // ========================================
  // COMPANY JOBS OPERATIONS
  // ========================================

  /**
   * Get company's jobs with pagination
   */
  async getCompanyJobs(id: string, page = 1, limit = 10) {
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

  // ========================================
  // COMPANY USERS OPERATIONS
  // ========================================

  /**
   * Get company's users with pagination
   */
  async getCompanyUsers(id: string, page = 1, limit = 10) {
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

  /**
   * Assign user to company
   */
  async assignUser(companyId: string, userId: string, companyRole: CompanyRole = CompanyRole.VIEWER) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        companyId,
        companyRole,
        joinedAt: new Date(),
      },
    });
  }

  /**
   * Remove user from company
   */
  async removeUser(companyId: string, userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        companyId: null,
        companyRole: CompanyRole.VIEWER,
        joinedAt: null,
      },
    });
  }

  /**
   * Update user role in company
   */
  async updateUserRole(companyId: string, userId: string, companyRole: CompanyRole) {
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

  // ========================================
  // VALIDATION OPERATIONS
  // ========================================

  /**
   * Check if company exists
   */
  async exists(id: string): Promise<boolean> {
    const company = await prisma.company.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!company;
  }

  /**
   * Check if user exists
   */
  async userExists(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    return !!user;
  }

  /**
   * Check if user already belongs to a company
   */
  async userBelongsToCompany(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    return !!user?.companyId;
  }

  /**
   * Check if user belongs to specific company
   */
  async userBelongsToSpecificCompany(userId: string, companyId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    return user?.companyId === companyId;
  }
}
