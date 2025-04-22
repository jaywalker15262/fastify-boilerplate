import jwt, { SignOptions } from 'jsonwebtoken';
import env from '@/config/env';

type TokenPayload = { id: string; email: string };

export function signAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, env.jwt.secret, options);
}

export function signRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwt.refreshExpiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, env.jwt.secret, options);
}

export function verifyToken(token: string): any {
  return jwt.verify(token, env.jwt.secret);
}

export function verifyRefreshToken(token: string): any {
  return jwt.verify(token, env.jwt.secret);
}

export function parseJwtExpires(expiresIn: string | number): number {
  if (typeof expiresIn === 'number') return expiresIn;

  const match = expiresIn.match(/^(\d+)([smhd])$/); // e.g. "1h"
  if (!match) return parseInt(expiresIn, 10);

  const [_, val, unit] = match;
  const n = parseInt(val, 10);

  switch (unit) {
    case 's': return n;
    case 'm': return n * 60;
    case 'h': return n * 3600;
    case 'd': return n * 86400;
    default: return n;
  }
}