/**
 * Validation middleware
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils/error.js';

/**
 * Validate request body against Zod schema
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        
        next(new ValidationError('Dữ liệu không hợp lệ', errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate request query parameters against Zod schema
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        
        next(new ValidationError('Tham số truy vấn không hợp lệ', errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate request parameters against Zod schema
 */
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        
        next(new ValidationError('Tham số đường dẫn không hợp lệ', errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate request headers against Zod schema
 */
export function validateHeaders<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.headers = schema.parse(req.headers) as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        
        next(new ValidationError('Header không hợp lệ', errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate file upload
 */
export function validateFile(options: {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = [], required = false } = options;
    
    if (required && !req.file) {
      return next(new ValidationError('File là bắt buộc'));
    }
    
    if (req.file) {
      // Check file size
      if (req.file.size > maxSize) {
        return next(new ValidationError(`File quá lớn. Kích thước tối đa: ${maxSize / 1024 / 1024}MB`));
      }
      
      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(req.file.mimetype)) {
        return next(new ValidationError(`Loại file không được hỗ trợ. Các loại được hỗ trợ: ${allowedTypes.join(', ')}`));
      }
    }
    
    next();
  };
}

/**
 * Validate multiple files upload
 */
export function validateFiles(options: {
  maxSize?: number;
  allowedTypes?: string[];
  maxCount?: number;
  required?: boolean;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = [], maxCount = 5, required = false } = options;
    const files = req.files as Express.Multer.File[];
    
    if (required && (!files || files.length === 0)) {
      return next(new ValidationError('Files là bắt buộc'));
    }
    
    if (files && files.length > 0) {
      // Check file count
      if (files.length > maxCount) {
        return next(new ValidationError(`Quá nhiều files. Tối đa: ${maxCount} files`));
      }
      
      // Check each file
      for (const file of files) {
        // Check file size
        if (file.size > maxSize) {
          return next(new ValidationError(`File ${file.originalname} quá lớn. Kích thước tối đa: ${maxSize / 1024 / 1024}MB`));
        }
        
        // Check file type
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
          return next(new ValidationError(`File ${file.originalname} có loại không được hỗ trợ. Các loại được hỗ trợ: ${allowedTypes.join(', ')}`));
        }
      }
    }
    
    next();
  };
}

/**
 * Validate pagination parameters
 */
export function validatePagination() {
  return validateQuery(z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  }));
}

/**
 * Validate sort parameters
 */
export function validateSort(allowedFields: string[]) {
  return validateQuery(z.object({
    sort: z.string().optional(),
    sortBy: z.enum(allowedFields as [string, ...string[]]).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }));
}

/**
 * Validate search parameters
 */
export function validateSearch() {
  return validateQuery(z.object({
    search: z.string().optional(),
    q: z.string().optional(),
  }));
}

/**
 * Validate ID parameter
 */
export function validateId() {
  return validateParams(z.object({
    id: z.string().cuid('ID không hợp lệ'),
  }));
}

/**
 * Validate UUID parameter
 */
export function validateUUID() {
  return validateParams(z.object({
    id: z.string().uuid('UUID không hợp lệ'),
  }));
}

/**
 * Validate email parameter
 */
export function validateEmail() {
  return validateParams(z.object({
    email: z.string().email('Email không hợp lệ'),
  }));
}

/**
 * Validate date range
 */
export function validateDateRange() {
  return validateQuery(z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }));
}

/**
 * Validate numeric range
 */
export function validateNumericRange() {
  return validateQuery(z.object({
    min: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    max: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  }));
}

/**
 * Validate array parameter
 */
export function validateArray(field: string) {
  return validateQuery(z.object({
    [field]: z.string().optional().transform(val => val ? val.split(',') : []),
  }));
}

/**
 * Validate boolean parameter
 */
export function validateBoolean(field: string) {
  return validateQuery(z.object({
    [field]: z.string().optional().transform(val => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  }));
}

/**
 * Validate enum parameter
 */
export function validateEnum(field: string, values: string[]) {
  return validateQuery(z.object({
    [field]: z.enum(values as [string, ...string[]]).optional(),
  }));
}

/**
 * Validate nested object
 */
export function validateNested<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate nested object in body
      if (req.body && typeof req.body === 'object') {
        req.body = schema.parse(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        
        next(new ValidationError('Dữ liệu lồng nhau không hợp lệ', errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate conditional schema
 */
export function validateConditional<T>(
  condition: (req: Request) => boolean,
  schema: z.ZodSchema<T>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (condition(req)) {
      return validateBody(schema)(req, res, next);
    }
    next();
  };
}

/**
 * Validate request size
 */
export function validateRequestSize(maxSize: number = 1024 * 1024) { // 1MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    
    if (contentLength > maxSize) {
      return next(new ValidationError(`Request quá lớn. Kích thước tối đa: ${maxSize / 1024 / 1024}MB`));
    }
    
    next();
  };
}

/**
 * Validate JSON content type
 */
export function validateJsonContentType() {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'];
    
    if (contentType && !contentType.includes('application/json')) {
      return next(new ValidationError('Content-Type phải là application/json'));
    }
    
    next();
  };
}

/**
 * Validate required fields
 */
export function validateRequired(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields: string[] = [];
    
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return next(new ValidationError(`Các trường bắt buộc: ${missingFields.join(', ')}`));
    }
    
    next();
  };
}
