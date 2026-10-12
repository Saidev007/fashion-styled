import { type NextFunction, type Request, type Response } from 'express';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  const error = new Error('Resource not found.') as Error & { statusCode?: number };
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error: Error & { statusCode?: number; code?: number; name?: string }, _req: Request, res: Response, _next: NextFunction) {
  let statusCode = error.statusCode ?? 500;
  let message = error.message || 'Internal server error.';
  if (error.name === 'ValidationError') { statusCode = 400; message = 'Request validation failed.'; }
  if (error.name === 'CastError') { statusCode = 400; message = 'Invalid resource identifier.'; }
  if (error.code === 11000) { statusCode = 409; message = 'An account with this email already exists.'; }
  res.status(statusCode).json({ success: false, message: statusCode >= 500 && process.env.NODE_ENV === 'production' ? 'Internal server error.' : message });
}
