import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'error') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const maybeAny = err as any;
  const isMongooseCastError = maybeAny?.name === 'CastError';
  if (isMongooseCastError) {
    res.status(400).json({ ok: false, code: 'validation_error', message: 'Invalid id' });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      ok: false,
      code: 'validation_error',
      message: 'Invalid request',
      issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
    return;
  }

  const error = err as Partial<AppError> & { message?: string; name?: string };

  // Duplicate key errors from MongoDB
  const isDuplicateKey = (error as any)?.code === 11000;
  if (isDuplicateKey) {
    res.status(409).json({ ok: false, code: 'conflict', message: 'Already exists' });
    return;
  }

  const statusCode = typeof error.statusCode === 'number' ? error.statusCode : 500;
  const code = typeof error.code === 'string' ? error.code : 'error';
  const message = typeof error.message === 'string' ? error.message : 'Unexpected error';

  if (statusCode >= 500) {
    console.error('[Error]', err);
  }

  res.status(statusCode).json({ ok: false, code, message });
}
