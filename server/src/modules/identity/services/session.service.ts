import { CACHE_KEYS } from '../../../infrastructure/cache/cache.keys';
import { cacheService } from '../../../infrastructure/cache/cache.service';
import { randomToken } from '../../../shared/utils/crypto';

export type AuthSubjectType = 'user' | 'customer';

export type SessionData = {
  subject: { type: AuthSubjectType; id: string; roles?: string[] };
  createdAt: string;
};

export function getSessionTtlSeconds(): number {
  const raw = process.env.AUTH_SESSION_TTL_SECONDS;
  const parsed = raw ? Number(raw) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return 60 * 60 * 24 * 7; // 7 days
  return Math.floor(parsed);
}

export async function createSession(subject: SessionData['subject']): Promise<{
  sessionId: string;
  session: SessionData;
  ttlSeconds: number;
}> {
  const sessionId = randomToken(32);
  const session: SessionData = { subject, createdAt: new Date().toISOString() };
  const ttlSeconds = getSessionTtlSeconds();

  await cacheService.set(CACHE_KEYS.AUTH.SESSION(sessionId), session, ttlSeconds);

  return { sessionId, session, ttlSeconds };
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
  return cacheService.get<SessionData>(CACHE_KEYS.AUTH.SESSION(sessionId));
}

export async function deleteSession(sessionId: string): Promise<void> {
  await cacheService.del(CACHE_KEYS.AUTH.SESSION(sessionId));
}

