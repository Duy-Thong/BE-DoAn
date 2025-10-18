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
  logger.error({ err, status, code }, message);
  res.status(status).json({ error: { message, status, code, details } });
}

