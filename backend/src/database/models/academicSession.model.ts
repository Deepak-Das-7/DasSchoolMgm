import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes } from '../base.schema';

export enum AcademicSessionStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export interface IAcademicSession extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  status: AcademicSessionStatus;
  schoolId: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const academicSessionSchema = new Schema<IAcademicSession>(
  {
    ...baseSchemaFields,
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(AcademicSessionStatus),
      default: AcademicSessionStatus.UPCOMING,
    },
  },
  baseSchemaOptions
);

academicSessionSchema.index(
  { schoolId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
academicSessionSchema.index({ schoolId: 1, isCurrent: 1 });
addBaseIndexes(academicSessionSchema);

export const AcademicSession = model<IAcademicSession>('AcademicSession', academicSessionSchema);
