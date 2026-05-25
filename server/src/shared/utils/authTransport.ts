import type { Request, Response } from 'express';

export const SESSION_COOKIE_NAME = 'sid';

export function readSessionId(req: Request): string | null {
  const authHeader = req.header('authorization');
  if (authHeader) {
    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() === 'bearer' && token) return token.trim();
  }

  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [k, ...rest] = part.trim().split('=');
    if (k === SESSION_COOKIE_NAME) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return null;
}

export function writeSessionCookie(res: Response, sessionId: string, ttlSeconds: number): void {
  const isProd = process.env.NODE_ENV === 'production';
  const domain =
    process.env.MAIN_DOMAIN && process.env.MAIN_DOMAIN !== 'localhost'
      ? process.env.MAIN_DOMAIN
      : undefined;

  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    domain,
    path: '/',
    maxAge: ttlSeconds * 1000,
  });
}

export function clearSessionCookie(res: Response): void {
  const domain =
    process.env.MAIN_DOMAIN && process.env.MAIN_DOMAIN !== 'localhost'
      ? process.env.MAIN_DOMAIN
      : undefined;

  res.cookie(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    domain,
    path: '/',
    maxAge: 0,
  });
}

