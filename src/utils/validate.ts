import { z } from 'zod';

/**
 * Validation Utility Functions
 * Centralized validation for all data types
 *
 * Use this for ALL validation needs in the application
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

  /**
   * Normalize email (lowercase and trim)
   */
  static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Check if value is empty
   */
  static isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  /**
   * Validate required field
   */
  static isRequired(value: any, fieldName: string): void {
    if (this.isEmpty(value)) {
      throw new Error(`${fieldName} là bắt buộc`);
    }
  }

  /**
   * Validate min length
   */
  static minLength(value: string, min: number, fieldName: string): void {
    if (value.length < min) {
      throw new Error(`${fieldName} phải có ít nhất ${min} ký tự`);
    }
  }

  /**
   * Validate max length
   */
  static maxLength(value: string, max: number, fieldName: string): void {
    if (value.length > max) {
      throw new Error(`${fieldName} không được vượt quá ${max} ký tự`);
    }
  }

  /**
   * Validate UUID format
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate number range
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Validate if string contains only alphanumeric characters
   */
  static isAlphanumeric(value: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(value);
  }

  /**
   * Validate if string contains only letters
   */
  static isAlpha(value: string): boolean {
    return /^[a-zA-Z]+$/.test(value);
  }

  /**
   * Validate if string contains only numbers
   */
  static isNumeric(value: string): boolean {
    return /^[0-9]+$/.test(value);
  }

  /**
   * Sanitize HTML (remove all tags)
   */
  static sanitizeHTML(input: string): string {
    return input.replace(/<[^>]*>/g, '');
  }

  /**
   * Validate and sanitize input for safety
   */
  static validateAndSanitize(input: string, options?: {
    maxLength?: number;
    allowHtml?: boolean;
    allowQuotes?: boolean;
  }): string {
    let sanitized = input.trim();

    // Remove HTML if not allowed
    if (!options?.allowHtml) {
      sanitized = sanitized.replace(/[<>]/g, '');
    }

    // Remove quotes if not allowed
    if (!options?.allowQuotes) {
      sanitized = sanitized.replace(/['"]/g, '');
    }

    // Limit length
    const maxLength = options?.maxLength || 1000;
    sanitized = sanitized.substring(0, maxLength);

    return sanitized;
  }
}

