import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';
import { DiscountType } from './feeDiscount.model';

export interface IScholarship extends Document, BaseDocumentFields {
  name: string;
  type: DiscountType;
  value: number;
  criteria?: string;
  maxRecipients?: number;
  validFrom: Date;
  validTo?: Date;
  isActive: boolean;
}

const scholarshipSchema = new Schema<IScholarship>(
  {
    ...baseSchemaFields,
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    criteria: { type: String, trim: true },
    maxRecipients: { type: Number, min: 1 },
    validFrom: { type: Date, required: true },
    validTo: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  baseSchemaOptions
);

addBaseIndexes(scholarshipSchema);
scholarshipSchema.index({ schoolId: 1, name: 1 });
scholarshipSchema.index({ schoolId: 1, isActive: 1 });

export const Scholarship = model<IScholarship>('Scholarship', scholarshipSchema);
