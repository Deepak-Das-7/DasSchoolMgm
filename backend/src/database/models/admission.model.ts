import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum AdmissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface IAdmissionStudentData {
  firstName: string;
  lastName: string;
  gender: string;
  dob: Date;
  classApplied: string;
  previousSchool?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  documents?: {
    name: string;
    type: string;
    url: string;
  }[];
}

export interface IAdmission extends Document, BaseDocumentFields {
  applicationNo: string;
  studentData: IAdmissionStudentData;
  status: AdmissionStatus;
  appliedDate: Date;
  reviewedBy?: Types.ObjectId;
}

const admissionDocumentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const admissionStudentDataSchema = new Schema<IAdmissionStudentData>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gender: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    classApplied: { type: String, required: true, trim: true },
    previousSchool: { type: String, trim: true },
    parentName: { type: String, required: true, trim: true },
    parentPhone: { type: String, required: true, trim: true },
    parentEmail: { type: String, lowercase: true, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    documents: { type: [admissionDocumentSchema], default: [] },
  },
  { _id: false }
);

const admissionSchema = new Schema<IAdmission>(
  {
    ...baseSchemaFields,
    applicationNo: { type: String, required: true, trim: true },
    studentData: { type: admissionStudentDataSchema, required: true },
    status: {
      type: String,
      enum: Object.values(AdmissionStatus),
      default: AdmissionStatus.PENDING,
    },
    appliedDate: { type: Date, required: true, default: Date.now },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  baseSchemaOptions
);

addBaseIndexes(admissionSchema);
admissionSchema.index({ schoolId: 1, applicationNo: 1 }, { unique: true });
admissionSchema.index({ schoolId: 1, status: 1 });
admissionSchema.index({ schoolId: 1, appliedDate: -1 });

export const Admission = model<IAdmission>('Admission', admissionSchema);
