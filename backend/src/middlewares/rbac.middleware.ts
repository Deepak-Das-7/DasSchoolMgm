import { Request, Response, NextFunction } from 'express';
import { hasPermission } from '../shared/constants/roles';
import { sendForbidden } from '../utils/apiResponse';

export function requirePermission(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendForbidden(res, 'Authentication required');
      return;
    }

    const hasAccess = permissions.some((perm) =>
      hasPermission(req.user!.permissions, perm)
    );

    if (!hasAccess) {
      sendForbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendForbidden(res, 'Insufficient role privileges');
      return;
    }
    next();
  };
}

export function requireSchoolContext(req: Request, res: Response, next: NextFunction): void {
  if (!req.user?.schoolId && req.user?.role !== 'super_admin') {
    sendForbidden(res, 'School context required');
    return;
  }
  next();
}
