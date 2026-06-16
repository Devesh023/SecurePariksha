import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Unhandled Error:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(status).json({
    status: 'error',
    message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}
