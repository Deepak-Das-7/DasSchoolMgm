import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum FineType {
  DAILY = 'daily',
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

export interface IFineRule extends Document, BaseDocumentFields {
  name: string;
  type: FineType;
  value: number;
  gracePeriodDays: number;
  applicableComponents: string[];
  isActive: boolean;
  description?: string;
}

const fineRuleSchema = new Schema<IFineRule>(
  {
    ...baseSchemaFields,
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: Object.values(FineType),
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    gracePeriodDays: { type: Number, default: 0, min: 0 },
    applicableComponents: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    description: { type: String, trim: true },
  },
  baseSchemaOptions
);

addBaseIndexes(fineRuleSchema);
fineRuleSchema.index({ schoolId: 1, name: 1 });
fineRuleSchema.index({ schoolId: 1, isActive: 1 });

export const FineRule = model<IFineRule>('FineRule', fineRuleSchema);
