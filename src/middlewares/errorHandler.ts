import type { NextFunction, Request, Response } from 'express';
import { logger } from '../loaders/logger.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || undefined;
  logger.error({ err, status }, message);
  res.status(status).json({ error: { message, status, details } });
}

