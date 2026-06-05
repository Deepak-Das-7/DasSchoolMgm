import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum AttendanceEntityType {
  STUDENT = 'student',
  TEACHER = 'teacher',
  EMPLOYEE = 'employee',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
}

export interface IAttendance extends Document, BaseDocumentFields {
  entityId: Types.ObjectId;
  entityType: AttendanceEntityType;
  date: Date;
  status: AttendanceStatus;
  remarks?: string;
  markedBy: Types.ObjectId;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    ...baseSchemaFields,
    entityId: { type: Schema.Types.ObjectId, required: true },
    entityType: {
      type: String,
      enum: Object.values(AttendanceEntityType),
      required: true,
    },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      required: true,
    },
    remarks: { type: String, trim: true },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  baseSchemaOptions
);

addBaseIndexes(attendanceSchema);
attendanceSchema.index(
  { schoolId: 1, date: 1, entityId: 1, entityType: 1 },
  { unique: true }
);
attendanceSchema.index({ schoolId: 1, entityId: 1, date: -1 });
attendanceSchema.index({ schoolId: 1, date: 1, status: 1 });

export const Attendance = model<IAttendance>('Attendance', attendanceSchema);
