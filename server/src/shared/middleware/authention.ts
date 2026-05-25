import type { NextFunction, Request, Response } from 'express';
import { AppError } from './errorHandler';
import { getSession } from '../../modules/identity/services/session.service';
import { readSessionId } from '../utils/authTransport';

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const sessionId = readSessionId(req);
  if (!sessionId) return next(new AppError('Unauthorized', 401, 'unauthorized'));

  const session = await getSession(sessionId);
  if (!session) return next(new AppError('Unauthorized', 401, 'unauthorized'));

  req.auth = { sessionId, subject: session.subject };
  next();
}

export async function requireUserAuth(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, (err?: unknown) => {
    if (err) return next(err);
    if (req.auth?.subject.type !== 'user') {
      return next(new AppError('Forbidden', 403, 'forbidden'));
    }
    next();
  });
}

export async function requireCustomerAuth(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, (err?: unknown) => {
    if (err) return next(err);
    if (req.auth?.subject.type !== 'customer') {
      return next(new AppError('Forbidden', 403, 'forbidden'));
    }
    next();
  });
}
