import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum StudentStatus {
  ACTIVE = 'active',
  ALUMNI = 'alumni',
  TRANSFERRED = 'transferred',
  INACTIVE = 'inactive',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export interface IStudentDocument {
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
}

export interface IStudent extends Document, BaseDocumentFields {
  admissionNo: string;
  rollNo?: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dob: Date;
  classId: Types.ObjectId;
  sectionId: Types.ObjectId;
  parentIds: Types.ObjectId[];
  documents: IStudentDocument[];
  status: StudentStatus;
  admissionDate: Date;
  bloodGroup?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  photo?: string;
}

const studentDocumentSchema = new Schema<IStudentDocument>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const studentSchema = new Schema<IStudent>(
  {
    ...baseSchemaFields,
    admissionNo: { type: String, required: true, trim: true },
    rollNo: { type: String, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gender: {
      type: String,
      enum: Object.values(Gender),
      required: true,
    },
    dob: { type: Date, required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    parentIds: [{ type: Schema.Types.ObjectId, ref: 'Parent' }],
    documents: { type: [studentDocumentSchema], default: [] },
    status: {
      type: String,
      enum: Object.values(StudentStatus),
      default: StudentStatus.ACTIVE,
    },
    admissionDate: { type: Date, required: true },
    bloodGroup: { type: String, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    photo: { type: String },
  },
  baseSchemaOptions
);

addBaseIndexes(studentSchema);
studentSchema.index({ schoolId: 1, admissionNo: 1 }, { unique: true });
studentSchema.index({ schoolId: 1, classId: 1, sectionId: 1 });
studentSchema.index({ schoolId: 1, status: 1 });
studentSchema.index({ parentIds: 1 });

export const Student = model<IStudent>('Student', studentSchema);
