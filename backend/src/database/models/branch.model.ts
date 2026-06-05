import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes } from '../base.schema';
import { Address } from '../../shared/types/common';

export enum BranchStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface IBranch extends Document {
  name: string;
  code: string;
  address: Address;
  phone?: string;
  email?: string;
  isMain: boolean;
  status: BranchStatus;
  schoolId: Types.ObjectId;
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

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    address: { type: addressSchema, required: true },
    phone: String,
    email: { type: String, lowercase: true, trim: true },
    isMain: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(BranchStatus),
      default: BranchStatus.ACTIVE,
    },
    ...baseSchemaFields,
  },
  baseSchemaOptions
);

branchSchema.index(
  { schoolId: 1, code: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
addBaseIndexes(branchSchema);

export const Branch = model<IBranch>('Branch', branchSchema);
