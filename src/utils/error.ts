/**
 * Error utility functions
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Không có quyền truy cập') {
    super(message, 401, true, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Bị cấm truy cập') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Không tìm thấy') {
    super(message, 404, true, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Xung đột dữ liệu') {
    super(message, 409, true, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Quá nhiều yêu cầu') {
    super(message, 429, true, 'RATE_LIMIT_ERROR');
  }
}

export class InternalError extends AppError {
  constructor(message: string = 'Lỗi máy chủ nội bộ') {
    super(message, 500, true, 'INTERNAL_ERROR');
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = 'Lỗi dịch vụ bên ngoài') {
    super(message, 502, true, 'EXTERNAL_SERVICE_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Lỗi cơ sở dữ liệu') {
    super(message, 500, true, 'DATABASE_ERROR');
  }
}

export class FileUploadError extends AppError {
  constructor(message: string = 'Lỗi tải file') {
    super(message, 400, true, 'FILE_UPLOAD_ERROR');
  }
}

export class EmailSendError extends AppError {
  constructor(message: string = 'Lỗi gửi email') {
    super(message, 500, true, 'EMAIL_SEND_ERROR');
  }
}

export class AIServiceError extends AppError {
  constructor(message: string = 'Lỗi dịch vụ AI') {
    super(message, 500, true, 'AI_SERVICE_ERROR');
  }
}

export class ErrorUtils {
  /**
   * Check if error is operational
   */
  static isOperationalError(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }

  /**
   * Convert error to AppError
   */
  static toAppError(error: Error): AppError {
    if (error instanceof AppError) {
      return error;
    }

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return new ValidationError(error.message);
    }

    if (error.name === 'CastError') {
      return new ValidationError('Dữ liệu không hợp lệ');
    }

    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return new DatabaseError('Lỗi cơ sở dữ liệu');
    }

    if (error.name === 'JsonWebTokenError') {
      return new AuthenticationError('Token không hợp lệ');
    }

    if (error.name === 'TokenExpiredError') {
      return new AuthenticationError('Token đã hết hạn');
    }

    if (error.name === 'MulterError') {
      return new FileUploadError('Lỗi tải file');
    }

    if (error.name === 'AxiosError') {
      return new ExternalServiceError('Lỗi kết nối dịch vụ bên ngoài');
    }

    // Default to internal error
    return new InternalError(error.message);
  }

  /**
   * Get error message for user
   */
  static getUserMessage(error: Error): string {
    if (error instanceof AppError) {
      return error.message;
    }

    // Don't expose internal error details to users
    return 'Có lỗi xảy ra, vui lòng thử lại sau';
  }

  /**
   * Get error details for logging
   */
  static getErrorDetails(error: Error): any {
    if (error instanceof AppError) {
      return {
        message: error.message,
        statusCode: error.statusCode,
        code: error.code,
        details: error.details,
        stack: error.stack,
      };
    }

    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  /**
   * Create error from status code
   */
  static createErrorFromStatusCode(statusCode: number, message?: string): AppError {
    switch (statusCode) {
      case 400:
        return new ValidationError(message || 'Yêu cầu không hợp lệ');
      case 401:
        return new AuthenticationError(message || 'Không có quyền truy cập');
      case 403:
        return new AuthorizationError(message || 'Bị cấm truy cập');
      case 404:
        return new NotFoundError(message || 'Không tìm thấy');
      case 409:
        return new ConflictError(message || 'Xung đột dữ liệu');
      case 429:
        return new RateLimitError(message || 'Quá nhiều yêu cầu');
      case 500:
        return new InternalError(message || 'Lỗi máy chủ nội bộ');
      case 502:
        return new ExternalServiceError(message || 'Lỗi dịch vụ bên ngoài');
      default:
        return new AppError(message || 'Có lỗi xảy ra', statusCode);
    }
  }

  /**
   * Handle async errors
   */
  static asyncHandler(fn: Function) {
    return (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Handle promise errors
   */
  static handlePromiseError<T>(promise: Promise<T>): Promise<[T | null, Error | null]> {
    return promise
      .then<[T, null]>((data: T) => [data, null])
      .catch<[null, Error]>((error: Error) => [null, error]);
  }

  /**
   * Retry with exponential backoff
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries - 1) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Log error with context
   */
  static logError(error: Error, context?: any): void {
    const errorDetails = this.getErrorDetails(error);
    const logData = {
      ...errorDetails,
      context,
      timestamp: new Date().toISOString(),
    };

    if (this.isOperationalError(error)) {
      console.warn('Operational Error:', logData);
    } else {
      console.error('Programmer Error:', logData);
    }
  }

  /**
   * Create error response
   */
  static createErrorResponse(error: Error): {
    success: false;
    error: string;
    code?: string;
    details?: any;
  } {
    const appError = this.toAppError(error);
    return {
      success: false,
      error: this.getUserMessage(appError),
      code: appError.code,
      details: appError.details,
    };
  }
}
