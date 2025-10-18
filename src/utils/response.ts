import { Response } from 'express';

/**
 * Standard API response utility
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}

export class ResponseUtils {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    error: string,
    statusCode: number = 400,
    message?: string,
    code?: string
  ): void {
    const response: ApiResponse = {
      success: false,
      error,
      code,
      message,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message?: string
  ): void {
    const pages = Math.ceil(pagination.total / pagination.limit);

    const response: ApiResponse<T[]> = {
      success: true,
      data,
      message,
      pagination: {
        ...pagination,
        pages,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  }

  /**
   * Send created response
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Tạo thành công'
  ): void {
    this.success(res, data, message, 201);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response, message: string = 'Xóa thành công'): void {
    const response: ApiResponse = {
      success: true,
      message,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    res.status(204).json(response);
  }

  /**
   * Send not found response
   */
  static notFound(
    res: Response,
    message: string = 'Không tìm thấy'
  ): void {
    this.error(res, message, 404);
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(
    res: Response,
    message: string = 'Không có quyền truy cập'
  ): void {
    this.error(res, message, 401);
  }

  /**
   * Send forbidden response
   */
  static forbidden(
    res: Response,
    message: string = 'Bị cấm truy cập'
  ): void {
    this.error(res, message, 403);
  }

  /**
   * Send bad request response
   */
  static badRequest(
    res: Response,
    message: string = 'Yêu cầu không hợp lệ'
  ): void {
    this.error(res, message, 400);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    errors: string[],
    message: string = 'Dữ liệu không hợp lệ'
  ): void {
    const response: ApiResponse = {
      success: false,
      error: message,
      data: { errors },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    res.status(422).json(response);
  }

  /**
   * Send internal server error response
   */
  static internalError(
    res: Response,
    message: string = 'Lỗi máy chủ nội bộ'
  ): void {
    this.error(res, message, 500);
  }

  /**
   * Send service unavailable response
   */
  static serviceUnavailable(
    res: Response,
    message: string = 'Dịch vụ không khả dụng'
  ): void {
    this.error(res, message, 503);
  }

  /**
   * Send too many requests response
   */
  static tooManyRequests(
    res: Response,
    message: string = 'Quá nhiều yêu cầu'
  ): void {
    this.error(res, message, 429);
  }

  /**
   * Send conflict response
   */
  static conflict(
    res: Response,
    message: string = 'Xung đột dữ liệu'
  ): void {
    this.error(res, message, 409);
  }

  /**
   * Send gone response
   */
  static gone(
    res: Response,
    message: string = 'Tài nguyên không còn tồn tại'
  ): void {
    this.error(res, message, 410);
  }

  /**
   * Send precondition failed response
   */
  static preconditionFailed(
    res: Response,
    message: string = 'Điều kiện tiên quyết không được đáp ứng'
  ): void {
    this.error(res, message, 412);
  }

  /**
   * Send unsupported media type response
   */
  static unsupportedMediaType(
    res: Response,
    message: string = 'Loại phương tiện không được hỗ trợ'
  ): void {
    this.error(res, message, 415);
  }

  /**
   * Send unprocessable entity response
   */
  static unprocessableEntity(
    res: Response,
    message: string = 'Không thể xử lý thực thể'
  ): void {
    this.error(res, message, 422);
  }

  /**
   * Send locked response
   */
  static locked(
    res: Response,
    message: string = 'Tài nguyên bị khóa'
  ): void {
    this.error(res, message, 423);
  }

  /**
   * Send failed dependency response
   */
  static failedDependency(
    res: Response,
    message: string = 'Phụ thuộc thất bại'
  ): void {
    this.error(res, message, 424);
  }

  /**
   * Send upgrade required response
   */
  static upgradeRequired(
    res: Response,
    message: string = 'Yêu cầu nâng cấp'
  ): void {
    this.error(res, message, 426);
  }

  /**
   * Send precondition required response
   */
  static preconditionRequired(
    res: Response,
    message: string = 'Yêu cầu điều kiện tiên quyết'
  ): void {
    this.error(res, message, 428);
  }

  /**
   * Send request header fields too large response
   */
  static requestHeaderFieldsTooLarge(
    res: Response,
    message: string = 'Trường tiêu đề yêu cầu quá lớn'
  ): void {
    this.error(res, message, 431);
  }

  /**
   * Send unavailable for legal reasons response
   */
  static unavailableForLegalReasons(
    res: Response,
    message: string = 'Không khả dụng vì lý do pháp lý'
  ): void {
    this.error(res, message, 451);
  }
}
