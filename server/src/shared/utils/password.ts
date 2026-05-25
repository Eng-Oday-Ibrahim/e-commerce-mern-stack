import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, keyHex] = stored.split(':');
  if (!salt || !keyHex) return false;

  const derived = scryptSync(password, salt, KEY_LENGTH);
  const key = Buffer.from(keyHex, 'hex');
  if (key.length !== derived.length) return false;
  return timingSafeEqual(key, derived);
}

