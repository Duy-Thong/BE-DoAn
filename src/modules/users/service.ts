import { UserRepository } from './repository.js';
import { AuthUtils } from '../../utils/auth.js';
import { ValidationUtils } from '../../utils/validate.js';
import { APP_CONSTANTS } from '../../utils/constants.js';
import { createValidationError, createNotFoundError } from '../../utils/error.js';
import type { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto.js';

/**
 * Users Service
 * Handles business logic for User operations
 * Uses UserRepository for data access
 */
export class UsersService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // ========================================
  // LIST USERS
  // ========================================
  async list(query: UserQueryDto) {
    return this.userRepository.findMany(query);
  }

  // ========================================
  // CREATE USER
  // ========================================
  async create(input: CreateUserDto) {
    // Input validation
    if (!input.email || !input.email.trim()) {
      throw createValidationError('Email không được để trống');
    }
    if (!ValidationUtils.isValidEmail(input.email)) {
      throw createValidationError('Email không hợp lệ');
    }
    if (!input.password || input.password.length < APP_CONSTANTS.PASSWORD_MIN_LENGTH) {
      throw createValidationError(`Mật khẩu phải có ít nhất ${APP_CONSTANTS.PASSWORD_MIN_LENGTH} ký tự`);
    }
    if (input.password.length > APP_CONSTANTS.PASSWORD_MAX_LENGTH) {
      throw createValidationError(`Mật khẩu không được vượt quá ${APP_CONSTANTS.PASSWORD_MAX_LENGTH} ký tự`);
    }
    if (!input.fullName || !input.fullName.trim()) {
      throw createValidationError('Họ tên không được để trống');
    }
    if (input.fullName.length > 255) {
      throw createValidationError('Họ tên quá dài');
    }

    // Business validation - password strength
    const passwordValidation = ValidationUtils.isValidPassword(input.password);
    if (!passwordValidation.isValid) {
      throw createValidationError(passwordValidation.errors);
    }

    // Business validation - phone number if provided
    if (input.phoneNumber && input.phoneNumber.trim()) {
      if (input.phoneNumber.length > 20) {
        throw createValidationError('Số điện thoại quá dài');
      }
      if (!ValidationUtils.isValidVietnamesePhone(input.phoneNumber)) {
        throw createValidationError('Số điện thoại không hợp lệ');
      }
    }

    // Business validation - nationality if provided
    if (input.nationality && input.nationality.length > 100) {
      throw createValidationError('Quốc tịch quá dài');
    }

    // Business validation - avatar URL if provided
    if (input.avatarUrl && input.avatarUrl.length > 500) {
      throw createValidationError('URL avatar quá dài');
    }

    // Sanitize input data
    const sanitizedInput: CreateUserDto = {
      ...input,
      fullName: ValidationUtils.sanitizeString(input.fullName),
      phoneNumber: input.phoneNumber ? ValidationUtils.sanitizeString(input.phoneNumber) : null,
      nationality: input.nationality ? ValidationUtils.sanitizeString(input.nationality) : null,
    };

    return this.userRepository.create(sanitizedInput);
  }

  // ========================================
  // GET USER BY ID
  // ========================================
  async getById(id: string) {
    return this.userRepository.findById(id);
  }

  // ========================================
  // UPDATE USER
  // ========================================
  async update(id: string, input: UpdateUserDto) {
    // Input validation - email if provided
    if (input.email !== undefined) {
      if (!input.email || !input.email.trim()) {
        throw createValidationError('Email không được để trống');
      }
      if (!ValidationUtils.isValidEmail(input.email)) {
        throw createValidationError('Email không hợp lệ');
      }
    }

    // Input validation - password if provided
    if (input.password !== undefined) {
      if (!input.password || input.password.length < APP_CONSTANTS.PASSWORD_MIN_LENGTH) {
        throw createValidationError(`Mật khẩu phải có ít nhất ${APP_CONSTANTS.PASSWORD_MIN_LENGTH} ký tự`);
      }
      if (input.password.length > APP_CONSTANTS.PASSWORD_MAX_LENGTH) {
        throw createValidationError(`Mật khẩu không được vượt quá ${APP_CONSTANTS.PASSWORD_MAX_LENGTH} ký tự`);
      }
    }

    // Input validation - fullName if provided
    if (input.fullName !== undefined) {
      if (!input.fullName || !input.fullName.trim()) {
        throw createValidationError('Họ tên không được để trống');
      }
      if (input.fullName.length > 255) {
        throw createValidationError('Họ tên quá dài');
      }
    }

    // Business validation - password strength if being updated
    if (input.password) {
      const passwordValidation = ValidationUtils.isValidPassword(input.password);
      if (!passwordValidation.isValid) {
        throw createValidationError(passwordValidation.errors);
      }
    }

    // Business validation - phone number if being updated
    if (input.phoneNumber !== undefined && input.phoneNumber && input.phoneNumber.trim()) {
      if (input.phoneNumber.length > 20) {
        throw createValidationError('Số điện thoại quá dài');
      }
      if (!ValidationUtils.isValidVietnamesePhone(input.phoneNumber)) {
        throw createValidationError('Số điện thoại không hợp lệ');
      }
    }

    // Business validation - nationality if provided
    if (input.nationality !== undefined && input.nationality && input.nationality.length > 100) {
      throw createValidationError('Quốc tịch quá dài');
    }

    // Business validation - avatar URL if provided
    if (input.avatarUrl !== undefined && input.avatarUrl && input.avatarUrl.length > 500) {
      throw createValidationError('URL avatar quá dài');
    }

    // Sanitize input data
    const sanitizedInput: UpdateUserDto = {
      ...input,
      fullName: input.fullName ? ValidationUtils.sanitizeString(input.fullName) : undefined,
      phoneNumber: input.phoneNumber ? ValidationUtils.sanitizeString(input.phoneNumber) : input.phoneNumber,
      nationality: input.nationality ? ValidationUtils.sanitizeString(input.nationality) : input.nationality,
    };

    return this.userRepository.update(id, sanitizedInput);
  }

  // ========================================
  // DELETE USER
  // ========================================
  async remove(id: string) {
    return this.userRepository.delete(id);
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  async updateLastLogin(id: string) {
    return this.userRepository.updateLastLogin(id);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async lockUser(id: string) {
    return this.userRepository.lockUser(id);
  }

  async unlockUser(id: string) {
    return this.userRepository.unlockUser(id);
  }

  async verifyEmail(id: string) {
    return this.userRepository.verifyEmail(id);
  }

  // ========================================
  // CHANGE PASSWORD
  // ========================================
  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findByIdWithPassword(id);

    if (!user) {
      throw createNotFoundError('Người dùng');
    }

    // Verify current password
    const isValidPassword = await AuthUtils.verifyPassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw createValidationError('Mật khẩu hiện tại không đúng');
    }

    // Validate new password strength
    const passwordValidation = ValidationUtils.isValidPassword(newPassword);
    if (!passwordValidation.isValid) {
      throw createValidationError(passwordValidation.errors);
    }

    // Hash and update new password
    const newPasswordHash = await AuthUtils.hashPassword(newPassword);
    await this.userRepository.updatePassword(id, newPasswordHash);

    return { message: 'Đổi mật khẩu thành công' };
  }
}
