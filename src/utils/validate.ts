import { z } from 'zod';

/**
 * Validation utility functions
 */

export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate Vietnamese phone number
   */
  static isValidVietnamesePhone(phone: string): boolean {
    const phoneRegex = /^(\+84|84|0)[1-9][0-9]{8,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Mật khẩu phải có ít nhất 8 ký tự');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 số');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Vietnamese ID card number
   */
  static isValidVietnameseIdCard(idCard: string): boolean {
    const idCardRegex = /^[0-9]{9,12}$/;
    return idCardRegex.test(idCard);
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate file size
   */
  static isValidFileSize(fileSize: number, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return fileSize <= maxSizeInBytes;
  }

  /**
   * Validate file type
   */
  static isValidFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  }

  /**
   * Validate date range
   */
  static isValidDateRange(startDate: Date | string, endDate: Date | string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  }

  /**
   * Validate age range
   */
  static isValidAge(birthDate: Date | string, minAge: number = 18, maxAge: number = 100): boolean {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) 
      ? age - 1 
      : age;
    
    return actualAge >= minAge && actualAge <= maxAge;
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate object against schema with custom error messages
   */
  static validateWithSchema<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    customErrorMap?: z.ZodErrorMap
  ): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(err => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        return { success: false, errors };
      }
      return { success: false, errors: ['Validation failed'] };
    }
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(page?: string, limit?: string): { page: number; limit: number } {
    const parsedPage = parseInt(page || '1', 10);
    const parsedLimit = parseInt(limit || '10', 10);

    return {
      page: Math.max(1, parsedPage),
      limit: Math.min(Math.max(1, parsedLimit), 100), // Max 100 items per page
    };
  }

  /**
   * Validate sort parameters
   */
  static validateSort(sortBy?: string, sortOrder?: string, allowedFields: string[] = []): {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  } {
    const validSortBy = allowedFields.includes(sortBy || '') ? sortBy! : allowedFields[0] || 'createdAt';
    const validSortOrder = sortOrder === 'desc' ? 'desc' : 'asc';

    return {
      sortBy: validSortBy,
      sortOrder: validSortOrder,
    };
  }

  /**
   * Validate search query
   */
  static validateSearchQuery(query?: string): string {
    if (!query) return '';
    
    return query
      .trim()
      .substring(0, 100) // Limit search query length
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, ''); // Remove quotes
  }
}
