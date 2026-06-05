import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface IStock extends Document, BaseDocumentFields {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  vendorId?: Types.ObjectId;
}

const stockSchema = new Schema<IStock>(
  {
    ...baseSchemaFields,
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    reorderLevel: { type: Number, required: true, min: 0 },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  },
  baseSchemaOptions
);

addBaseIndexes(stockSchema);
stockSchema.index({ schoolId: 1, name: 1, category: 1 });
stockSchema.index({ schoolId: 1, quantity: 1, reorderLevel: 1 });
stockSchema.index({ vendorId: 1 }, { sparse: true });

export const Stock = model<IStock>('Stock', stockSchema);
