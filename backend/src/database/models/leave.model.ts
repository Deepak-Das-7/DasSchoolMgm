import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum LeaveEntityType {
  TEACHER = 'teacher',
  EMPLOYEE = 'employee',
}

export enum LeaveType {
  SICK = 'sick',
  CASUAL = 'casual',
  EARNED = 'earned',
  UNPAID = 'unpaid',
  OTHER = 'other',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface ILeave extends Document, BaseDocumentFields {
  entityId: Types.ObjectId;
  entityType: LeaveEntityType;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  approvedBy?: Types.ObjectId;
  remarks?: string;
}

const leaveSchema = new Schema<ILeave>(
  {
    ...baseSchemaFields,
    entityId: { type: Schema.Types.ObjectId, required: true },
    entityType: {
      type: String,
      enum: Object.values(LeaveEntityType),
      required: true,
    },
    leaveType: {
      type: String,
      enum: Object.values(LeaveType),
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(LeaveStatus),
      default: LeaveStatus.PENDING,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String, trim: true },
  },
  baseSchemaOptions
);

addBaseIndexes(leaveSchema);
leaveSchema.index({ schoolId: 1, entityId: 1, entityType: 1, startDate: -1 });
leaveSchema.index({ schoolId: 1, status: 1 });

export const Leave = model<ILeave>('Leave', leaveSchema);
