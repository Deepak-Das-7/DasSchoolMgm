import { Schema, model, Document, Types, models } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes } from '../base.schema';
import { Address } from '../../shared/types/common';

export enum SchoolStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
}

export interface ISchoolSubscription {
  plan: string;
  status: string;
  startDate: Date;
  endDate: Date;
  maxStudents?: number;
  maxStaff?: number;
}

export interface ISchoolBranding {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  theme?: string;
}

export interface ISchoolSettings {
  timezone?: string;
  dateFormat?: string;
  currency?: string;
  language?: string;
  academicYearStart?: number;
  enableSms?: boolean;
  enableEmail?: boolean;
  [key: string]: unknown;
}

export interface ISchool extends Omit<Document, 'schoolId'> {
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
  // schoolId: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<Address>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const schoolSchema = new Schema<ISchool>(
  {
    ...baseSchemaFields,
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: addressSchema, required: true },
    subscription: {
      plan: { type: String, required: true, default: 'trial' },
      status: { type: String, required: true, default: 'active' },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      maxStudents: Number,
      maxStaff: Number,
    },
    branding: {
      logo: String,
      primaryColor: { type: String, default: '#2563eb' },
      secondaryColor: { type: String, default: '#1e40af' },
      theme: { type: String, default: 'light' },
    },
    domain: { type: String, sparse: true, lowercase: true, trim: true, unique: true },
    settings: {
      timezone: { type: String, default: 'Asia/Kolkata' },
      dateFormat: { type: String, default: 'DD/MM/YYYY' },
      currency: { type: String, default: 'INR' },
      language: { type: String, default: 'en' },
      academicYearStart: { type: Number, default: 4 },
      enableSms: { type: Boolean, default: false },
      enableEmail: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: Object.values(SchoolStatus),
      default: SchoolStatus.TRIAL,
    },
  },
  baseSchemaOptions
);

addBaseIndexes(schoolSchema);
schoolSchema.index({ status: 1 });
schoolSchema.index({ email: 1 });
schoolSchema.index({ name: 'text', code: 'text', email: 'text' });

export const School = models.School || model<ISchool>('School', schoolSchema);