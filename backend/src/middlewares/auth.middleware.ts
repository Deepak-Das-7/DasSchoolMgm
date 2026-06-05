import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendUnauthorized } from '../utils/apiResponse';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string | undefined;

  let token: string | undefined;

  // 1. Check for Bearer token in headers first
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  // 2. Fallback to token query parameter for file generation streams
  else if (queryToken) {
    token = queryToken;
  }

  // If neither exists, block the request immediately
  if (!token) {
    sendUnauthorized(res, 'Access token required');
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      schoolId: payload.schoolId,
      permissions: payload.permissions,
    };
    req.schoolId = payload.schoolId;
    next();
  } catch {
    sendUnauthorized(res, 'Invalid or expired access token');
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string | undefined;

  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (queryToken) {
    token = queryToken;
  }

  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        schoolId: payload.schoolId,
        permissions: payload.permissions,
      };
      req.schoolId = payload.schoolId;
    } catch {
      // Continue without auth
    }
  }
  next();
}