import { CompanyRepository } from './repository.js';
import { ValidationUtils } from '../../utils/validate.js';
import { APP_CONSTANTS } from '../../utils/constants.js';
import { createValidationError, createNotFoundError, createConflictError } from '../../utils/error.js';
import { CompanyRole } from '../../generated/prisma/index.js';
import type { CreateCompanyDto, UpdateCompanyDto, CompanyQueryDto } from './dto.js';

/**
 * Companies Service
 * Handles business logic for Company operations
 * Uses CompanyRepository for data access
 */
export class CompaniesService {
  private companyRepository: CompanyRepository;

  constructor() {
    this.companyRepository = new CompanyRepository();
  }
  // ========================================
  // LIST COMPANIES
  // ========================================
  async list(query: CompanyQueryDto) {
    return this.companyRepository.findMany(query);
  }

  // ========================================
  // CREATE COMPANY
  // ========================================
  async create(input: CreateCompanyDto) {
    // Input validation
    if (!input.name || !input.name.trim()) {
      throw createValidationError('Tên công ty không được để trống');
    }
    if (input.name.length > 255) {
      throw createValidationError('Tên công ty không được vượt quá 255 ký tự');
    }

    // Business validation - website if provided
    if (input.website && input.website.trim()) {
      if (input.website.length > 500) {
        throw createValidationError('Website quá dài');
      }
    }

    // Business validation - description if provided
    if (input.description && input.description.length > 2000) {
      throw createValidationError('Mô tả không được vượt quá 2000 ký tự');
    }

    // Business validation - industry if provided
    if (input.industry && input.industry.length > 100) {
      throw createValidationError('Ngành nghề không được vượt quá 100 ký tự');
    }

    // Business validation - founded year if provided
    if (input.foundedYear !== undefined && input.foundedYear !== null) {
      if (input.foundedYear < 1800) {
        throw createValidationError('Năm thành lập không được nhỏ hơn 1800');
      }
      if (input.foundedYear > new Date().getFullYear()) {
        throw createValidationError(`Năm thành lập không được lớn hơn ${new Date().getFullYear()}`);
      }
    }

    // Business validation - address if provided
    if (input.address && input.address.length > 500) {
      throw createValidationError('Địa chỉ không được vượt quá 500 ký tự');
    }

    // Business validation - phone if provided
    if (input.phone && input.phone.trim()) {
      if (!/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(input.phone)) {
        throw createValidationError('Số điện thoại không hợp lệ (10-15 chữ số)');
      }
    }

    // Business validation - email if provided
    if (input.email && input.email.trim()) {
      if (!ValidationUtils.isValidEmail(input.email)) {
        throw createValidationError('Email không hợp lệ');
      }
    }

    // Business validation - logo URL if provided
    if (input.logoUrl && input.logoUrl.length > 500) {
      throw createValidationError('Logo URL quá dài');
    }

    // Business validation - banner URL if provided
    if (input.bannerUrl && input.bannerUrl.length > 500) {
      throw createValidationError('Banner URL quá dài');
    }

    // Sanitize input data
    const sanitizedInput: CreateCompanyDto = {
      ...input,
      name: ValidationUtils.sanitizeString(input.name),
      website: input.website ? ValidationUtils.sanitizeString(input.website) : null,
      description: input.description ? ValidationUtils.sanitizeString(input.description) : null,
      industry: input.industry ? ValidationUtils.sanitizeString(input.industry) : null,
      address: input.address ? ValidationUtils.sanitizeString(input.address) : null,
      phone: input.phone ? ValidationUtils.sanitizeString(input.phone) : null,
      email: input.email ? ValidationUtils.sanitizeString(input.email) : null,
    };

    return this.companyRepository.create(sanitizedInput);
  }

  // ========================================
  // GET COMPANY BY ID
  // ========================================
  async getById(id: string) {
    const company = await this.companyRepository.findById(id);

    if (!company) {
      throw createNotFoundError('Công ty');
    }

    return company;
  }

  // ========================================
  // UPDATE COMPANY
  // ========================================
  async update(id: string, input: UpdateCompanyDto) {
    // Check if company exists
    const companyExists = await this.companyRepository.exists(id);
    if (!companyExists) {
      throw createNotFoundError('Công ty');
    }

    // Input validation - name if provided
    if (input.name !== undefined) {
      if (!input.name || !input.name.trim()) {
        throw createValidationError('Tên công ty không được để trống');
      }
      if (input.name.length > 255) {
        throw createValidationError('Tên công ty không được vượt quá 255 ký tự');
      }
    }

    // Business validation - website if provided
    if (input.website !== undefined && input.website && input.website.trim()) {
      if (input.website.length > 500) {
        throw createValidationError('Website quá dài');
      }
    }

    // Business validation - description if provided
    if (input.description !== undefined && input.description && input.description.length > 2000) {
      throw createValidationError('Mô tả không được vượt quá 2000 ký tự');
    }

    // Business validation - industry if provided
    if (input.industry !== undefined && input.industry && input.industry.length > 100) {
      throw createValidationError('Ngành nghề không được vượt quá 100 ký tự');
    }

    // Business validation - founded year if provided
    if (input.foundedYear !== undefined && input.foundedYear !== null) {
      if (input.foundedYear < 1800) {
        throw createValidationError('Năm thành lập không được nhỏ hơn 1800');
      }
      if (input.foundedYear > new Date().getFullYear()) {
        throw createValidationError(`Năm thành lập không được lớn hơn ${new Date().getFullYear()}`);
      }
    }

    // Business validation - address if provided
    if (input.address !== undefined && input.address && input.address.length > 500) {
      throw createValidationError('Địa chỉ không được vượt quá 500 ký tự');
    }

    // Business validation - phone if provided
    if (input.phone !== undefined && input.phone && input.phone.trim()) {
      if (!/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(input.phone)) {
        throw createValidationError('Số điện thoại không hợp lệ (10-15 chữ số)');
      }
    }

    // Business validation - email if provided
    if (input.email !== undefined && input.email && input.email.trim()) {
      if (!ValidationUtils.isValidEmail(input.email)) {
        throw createValidationError('Email không hợp lệ');
      }
    }

    // Business validation - logo URL if provided
    if (input.logoUrl !== undefined && input.logoUrl && input.logoUrl.length > 500) {
      throw createValidationError('Logo URL quá dài');
    }

    // Business validation - banner URL if provided
    if (input.bannerUrl !== undefined && input.bannerUrl && input.bannerUrl.length > 500) {
      throw createValidationError('Banner URL quá dài');
    }

    // Sanitize input data
    const sanitizedInput: UpdateCompanyDto = {
      ...input,
      name: input.name ? ValidationUtils.sanitizeString(input.name) : undefined,
      website: input.website ? ValidationUtils.sanitizeString(input.website) : input.website,
      description: input.description ? ValidationUtils.sanitizeString(input.description) : input.description,
      industry: input.industry ? ValidationUtils.sanitizeString(input.industry) : input.industry,
      address: input.address ? ValidationUtils.sanitizeString(input.address) : input.address,
      phone: input.phone ? ValidationUtils.sanitizeString(input.phone) : input.phone,
      email: input.email ? ValidationUtils.sanitizeString(input.email) : input.email,
    };

    return this.companyRepository.update(id, sanitizedInput);
  }

  // ========================================
  // DELETE COMPANY
  // ========================================
  async remove(id: string) {
    const companyExists = await this.companyRepository.exists(id);
    if (!companyExists) {
      throw createNotFoundError('Công ty');
    }

    await this.companyRepository.delete(id);
    return { message: 'Xóa công ty thành công' };
  }

  // ========================================
  // COMPANY STATUS OPERATIONS
  // ========================================
  async verifyCompany(id: string) {
    return this.companyRepository.verify(id);
  }

  async unverifyCompany(id: string) {
    return this.companyRepository.unverify(id);
  }

  async activateCompany(id: string) {
    return this.companyRepository.activate(id);
  }

  async deactivateCompany(id: string) {
    return this.companyRepository.deactivate(id);
  }

  // ========================================
  // COMPANY JOBS
  // ========================================
  async getCompanyJobs(id: string, page = 1, limit = 10) {
    const companyExists = await this.companyRepository.exists(id);
    if (!companyExists) {
      throw createNotFoundError('Công ty');
    }

    return this.companyRepository.getCompanyJobs(id, page, limit);
  }

  // ========================================
  // COMPANY USERS
  // ========================================
  async getCompanyUsers(id: string, page = 1, limit = 10) {
    const companyExists = await this.companyRepository.exists(id);
    if (!companyExists) {
      throw createNotFoundError('Công ty');
    }

    return this.companyRepository.getCompanyUsers(id, page, limit);
  }

  // ========================================
  // USER MANAGEMENT
  // ========================================
  async assignUser(companyId: string, userId: string, companyRole: CompanyRole = CompanyRole.VIEWER) {
    // Check if company exists
    const companyExists = await this.companyRepository.exists(companyId);
    if (!companyExists) {
      throw createNotFoundError('Công ty');
    }

    // Check if user exists
    const userExists = await this.companyRepository.userExists(userId);
    if (!userExists) {
      throw createNotFoundError('Người dùng');
    }

    // Check if user already belongs to a company
    const userBelongsToCompany = await this.companyRepository.userBelongsToCompany(userId);
    if (userBelongsToCompany) {
      throw createConflictError('Người dùng đã thuộc về một công ty khác');
    }

    return this.companyRepository.assignUser(companyId, userId, companyRole);
  }

  async removeUser(companyId: string, userId: string) {
    // Check if user belongs to specific company
    const userBelongsToCompany = await this.companyRepository.userBelongsToSpecificCompany(userId, companyId);
    if (!userBelongsToCompany) {
      throw createConflictError('Người dùng không thuộc về công ty này');
    }

    return this.companyRepository.removeUser(companyId, userId);
  }

  async updateUserRole(companyId: string, userId: string, companyRole: CompanyRole) {
    // Check if user belongs to specific company
    const userBelongsToCompany = await this.companyRepository.userBelongsToSpecificCompany(userId, companyId);
    if (!userBelongsToCompany) {
      throw createConflictError('Người dùng không thuộc về công ty này');
    }

    return this.companyRepository.updateUserRole(companyId, userId, companyRole);
  }
}

