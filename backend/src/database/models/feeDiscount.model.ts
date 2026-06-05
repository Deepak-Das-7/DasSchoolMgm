import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export interface IFeeDiscount extends Document, BaseDocumentFields {
  name: string;
  type: DiscountType;
  value: number;
  classIds: Types.ObjectId[];
  validFrom: Date;
  validTo?: Date;
  isActive: boolean;
  description?: string;
}

const feeDiscountSchema = new Schema<IFeeDiscount>(
  {
    ...baseSchemaFields,
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    classIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    validFrom: { type: Date, required: true },
    validTo: { type: Date },
    isActive: { type: Boolean, default: true },
    description: { type: String, trim: true },
  },
  baseSchemaOptions
);

addBaseIndexes(feeDiscountSchema);
feeDiscountSchema.index({ schoolId: 1, name: 1 });
feeDiscountSchema.index({ schoolId: 1, isActive: 1 });

export const FeeDiscount = model<IFeeDiscount>('FeeDiscount', feeDiscountSchema);
