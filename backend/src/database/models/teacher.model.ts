import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum TeacherStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  RESIGNED = 'resigned',
}

export interface ITeacherQualification {
  degree: string;
  institution: string;
  year: number;
}

export interface ITeacher extends Document, BaseDocumentFields {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  qualifications: ITeacherQualification[];
  subjects: Types.ObjectId[];
  classIds: Types.ObjectId[];
  salary: number;
  joiningDate: Date;
  status: TeacherStatus;
}

const qualificationSchema = new Schema<ITeacherQualification>(
  {
    degree: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
  },
  { _id: false }
);

const teacherSchema = new Schema<ITeacher>(
  {
    ...baseSchemaFields,
    employeeId: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    qualifications: { type: [qualificationSchema], default: [] },
    subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
    classIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    salary: { type: Number, required: true, min: 0 },
    joiningDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(TeacherStatus),
      default: TeacherStatus.ACTIVE,
    },
  },
  baseSchemaOptions
);

addBaseIndexes(teacherSchema);
teacherSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true });
teacherSchema.index({ schoolId: 1, email: 1 });
teacherSchema.index({ schoolId: 1, status: 1 });

export const Teacher = model<ITeacher>('Teacher', teacherSchema);
