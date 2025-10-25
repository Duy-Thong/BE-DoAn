/**
 * Validation utility functions
 */

import { z } from 'zod';
import { ValidationError } from './error.js';

/**
 * Create detailed validation error from Zod error
 */
export function createDetailedValidationError(zodError: z.ZodError, context: string = 'Validation'): ValidationError {
  const errors = zodError.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
    received: issue.input,
    expected: getExpectedValue(issue),
    path: issue.path,
  }));

  // Tạo thông báo lỗi chi tiết
  const errorMessages = errors.map(err => {
    if (err.field) {
      return `${err.field}: ${err.message}`;
    }
    return err.message;
  }).join(', ');

  const detailedMessage = `${context} failed: ${errorMessages}`;
  
  return new ValidationError(detailedMessage, errors);
}

/**
 * Get expected value description from Zod issue
 */
function getExpectedValue(issue: z.ZodIssue): string | undefined {
  switch (issue.code) {
    case 'invalid_type':
      return `Expected ${issue.expected}, received ${issue.received}`;
    case 'invalid_string':
      if (issue.validation === 'email') return 'Valid email address';
      if (issue.validation === 'url') return 'Valid URL';
      if (issue.validation === 'uuid') return 'Valid UUID';
      if (issue.validation === 'datetime') return 'Valid datetime';
      return 'Valid string';
    case 'too_small':
      if (issue.type === 'string') return `At least ${issue.minimum} characters`;
      if (issue.type === 'number') return `At least ${issue.minimum}`;
      if (issue.type === 'array') return `At least ${issue.minimum} items`;
      return `Minimum ${issue.minimum}`;
    case 'too_big':
      if (issue.type === 'string') return `At most ${issue.maximum} characters`;
      if (issue.type === 'number') return `At most ${issue.maximum}`;
      if (issue.type === 'array') return `At most ${issue.maximum} items`;
      return `Maximum ${issue.maximum}`;
    case 'invalid_enum_value':
      return `One of: ${issue.options.join(', ')}`;
    case 'invalid_literal':
      return `Expected "${issue.expected}"`;
    case 'custom':
      return issue.message;
    default:
      return undefined;
  }
}

/**
 * Validate and transform data with detailed error handling
 */
export function validateWithDetails<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string = 'Validation'
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createDetailedValidationError(error, context);
    }
    throw error;
  }
}

/**
 * Safe parse with detailed error handling
 */
export function safeParseWithDetails<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string = 'Validation'
): { success: true; data: T } | { success: false; error: ValidationError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    error: createDetailedValidationError(result.error, context)
  };
}

/**
 * Create field-specific validation error
 */
export function createFieldError(field: string, message: string, received?: any): ValidationError {
  const error = {
    field,
    message,
    code: 'custom',
    received,
    path: [field],
  };

  return new ValidationError(`${field}: ${message}`, [error]);
}

/**
 * Validate required fields
 */
export function validateRequiredFields(data: Record<string, any>, requiredFields: string[]): void {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    const errors = missingFields.map(field => ({
      field,
      message: `${field} is required`,
      code: 'custom',
      received: data[field],
      path: [field],
    }));
    
    throw new ValidationError(`Required fields missing: ${missingFields.join(', ')}`, errors);
  }
}

/**
 * Validate field format
 */
export function validateFieldFormat(field: string, value: any, format: string, pattern?: RegExp): void {
  if (value === undefined || value === null || value === '') {
    return; // Skip validation for empty values
  }
  
  let isValid = false;
  let message = '';
  
  switch (format) {
    case 'email':
      isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      message = 'Invalid email format';
      break;
    case 'url':
      try {
        new URL(value);
        isValid = true;
      } catch {
        isValid = false;
        message = 'Invalid URL format';
      }
      break;
    case 'phone':
      isValid = /^[\+]?[0-9\s\-\(\)]{10,15}$/.test(value);
      message = 'Invalid phone number format';
      break;
    case 'uuid':
      isValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
      message = 'Invalid UUID format';
      break;
    case 'regex':
      if (pattern) {
        isValid = pattern.test(value);
        message = 'Invalid format';
      }
      break;
    default:
      return;
  }
  
  if (!isValid) {
    throw createFieldError(field, message, value);
  }
}

/**
 * Validate array of items
 */
export function validateArrayItems<T>(
  items: T[],
  validator: (item: T, index: number) => void,
  context: string = 'Array validation'
): void {
  const errors: any[] = [];
  
  items.forEach((item, index) => {
    try {
      validator(item, index);
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(...(error.details || []).map(detail => ({
          ...detail,
          path: [index, ...(detail.path || [])],
        })));
      } else {
        errors.push({
          field: `[${index}]`,
          message: error instanceof Error ? error.message : 'Validation failed',
          code: 'custom',
          received: item,
          path: [index],
        });
      }
    }
  });
  
  if (errors.length > 0) {
    throw new ValidationError(`${context} failed for ${errors.length} items`, errors);
  }
}

/**
 * Validate conditional fields
 */
export function validateConditionalFields(
  data: Record<string, any>,
  conditions: Array<{
    field: string;
    condition: (data: Record<string, any>) => boolean;
    message: string;
  }>
): void {
  const errors: any[] = [];
  
  for (const { field, condition, message } of conditions) {
    if (!condition(data)) {
      errors.push({
        field,
        message,
        code: 'custom',
        received: data[field],
        path: [field],
      });
    }
  }
  
  if (errors.length > 0) {
    const errorMessages = errors.map(err => `${err.field}: ${err.message}`).join(', ');
    throw new ValidationError(`Conditional validation failed: ${errorMessages}`, errors);
  }
}
