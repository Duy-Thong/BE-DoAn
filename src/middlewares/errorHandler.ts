import type { NextFunction, Request, Response } from 'express';
import { logger } from '../loaders/logger.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || undefined;
  const details = err.details || undefined;
  
  // Log error với thông tin chi tiết
  logger.error({ 
    err, 
    status, 
    code, 
    details,
    stack: err.stack 
  }, message);
  
  // Trả về response với thông tin lỗi chi tiết
  const errorResponse: any = {
    success: false,
    error: {
      message,
      status,
      code,
      timestamp: new Date().toISOString()
    }
  };
  
  // Thêm details nếu có (cho validation errors)
  if (details && Array.isArray(details)) {
    errorResponse.error.details = details;
    errorResponse.error.fields = details.map((d: any) => ({
      field: d.field,
      message: d.message,
      code: d.code,
      received: d.received
    }));
  } else if (details) {
    errorResponse.error.details = details;
  }
  
  // Trong development, thêm stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }
  
  res.status(status).json(errorResponse);
}

