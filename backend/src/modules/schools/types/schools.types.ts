import { Request } from 'express';
import {
  ISchoolBranding,
  ISchoolSettings,
  ISchoolSubscription,
  SchoolStatus,
} from '../../../database/models';
import { Address } from '../../../shared/types/common';
import { AppError } from '../../../middlewares/error.middleware';
import { UserRole } from '../../../shared/constants/roles';

export interface SchoolResponse {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: Address;
  subscription: ISchoolSubscription;
  branding: ISchoolBranding;
  domain?: string;
  settings: ISchoolSettings;
  status: SchoolStatus;
  createdAt: Date;
  updatedAt: Date;
}

export function resolveSchoolId(req: Request): string {
  if (req.user?.schoolId) {
    return req.user.schoolId;
  }

  const schoolId = (req.query.schoolId as string) || (req.body.schoolId as string);
  if (!schoolId) {
    throw new AppError('schoolId is required for platform-level operations', 400);
  }

  return schoolId;
}

export function canAccessSchool(req: Request, schoolId: string): boolean {
  if (!req.user) return false;
  if (req.user.role === UserRole.SUPER_ADMIN) return true;
  return req.user.schoolId === schoolId;
}

export function assertSchoolAccess(req: Request, schoolId: string): void {
  if (!canAccessSchool(req, schoolId)) {
    throw new AppError('You do not have access to this school', 403);
  }
}
