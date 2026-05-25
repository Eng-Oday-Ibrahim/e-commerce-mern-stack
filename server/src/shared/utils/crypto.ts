import { createHash, randomBytes, randomInt, timingSafeEqual } from 'crypto';

export function randomToken(bytes: number = 32): string {
  return randomBytes(bytes).toString('hex');
}

export function randomNumericCode(digits: number = 6): string {
  const n = Number.isFinite(digits) ? Math.floor(digits) : 6;
  const safeDigits = n <= 0 ? 6 : n;
  let out = '';
  for (let i = 0; i < safeDigits; i++) out += String(randomInt(0, 10));
  return out;
}

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function safeEqualHex(aHex: string, bHex: string): boolean {
  const a = Buffer.from(aHex, 'hex');
  const b = Buffer.from(bHex, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
