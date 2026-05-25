import type { NextFunction, Request, Response } from 'express';
import { AppError } from './errorHandler';

export function requireRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth || req.auth.subject.type !== 'user') {
      return next(new AppError('Forbidden', 403, 'forbidden'));
    }

    const userRoles = req.auth.subject.roles ?? [];
    if (userRoles.length === 0) {
      // No role information is stored for users after role removal.
      // Allow all authenticated users to access endpoints that previously required roles.
      return next();
    }

    const ok = roles.some((r) => userRoles.includes(r));
    if (!ok) return next(new AppError('Forbidden', 403, 'forbidden'));

    next();
  };
}
