import { Types } from 'mongoose';

export function buildAuditFields(userId: string, schoolId: string | null) {
  return {
    createdBy: new Types.ObjectId(userId),
    updatedBy: new Types.ObjectId(userId),
    schoolId: schoolId ? new Types.ObjectId(schoolId) : null,
  };
}

export function toObjectIds(ids: string[]): Types.ObjectId[] {
  return ids.map((id) => new Types.ObjectId(id));
}
