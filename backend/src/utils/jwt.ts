import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthUser } from '../shared/types/common';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  schoolId: string | null;
  permissions: string[];
}

export function generateAccessToken(user: AuthUser): string {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId,
    permissions: user.permissions,
  };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): { id: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
}
