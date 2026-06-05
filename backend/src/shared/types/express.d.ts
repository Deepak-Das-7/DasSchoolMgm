import { AuthUser } from './common';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      schoolId?: string | null;
    }
  }
}

export {};
