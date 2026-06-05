import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../modules/audit/audit.model';

export function auditLog(action: string, entity: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown) {
      if (res.statusCode < 400 && req.user) {
        const entityId = (body as { data?: { id?: string; _id?: string } })?.data?.id ||
          (body as { data?: { id?: string; _id?: string } })?.data?._id ||
          req.params.id;

        AuditLog.create({
          schoolId: req.user.schoolId,
          action,
          entity,
          entityId,
          userId: req.user.id,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          metadata: { method: req.method, path: req.path },
          createdBy: req.user.id,
          updatedBy: req.user.id,
        }).catch((err) => console.error('Audit log failed:', err));
      }
      return originalJson(body);
    };

    next();
  };
}
