import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface IVendor extends Document, BaseDocumentFields {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  gstNo?: string;
}

const vendorSchema = new Schema<IVendor>(
  {
    ...baseSchemaFields,
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    gstNo: { type: String, trim: true, uppercase: true },
  },
  baseSchemaOptions
);

addBaseIndexes(vendorSchema);
vendorSchema.index({ schoolId: 1, name: 1 });
vendorSchema.index({ schoolId: 1, gstNo: 1 }, { sparse: true });

export const Vendor = model<IVendor>('Vendor', vendorSchema);
