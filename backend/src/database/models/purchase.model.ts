import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum PurchaseStatus {
  PENDING = 'pending',
  ORDERED = 'ordered',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export interface IPurchaseItem {
  stockId?: Types.ObjectId;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IPurchase extends Document, BaseDocumentFields {
  vendorId: Types.ObjectId;
  items: IPurchaseItem[];
  totalAmount: number;
  purchaseDate: Date;
  invoiceNo: string;
  status: PurchaseStatus;
}

const purchaseItemSchema = new Schema<IPurchaseItem>(
  {
    stockId: { type: Schema.Types.ObjectId, ref: 'Stock' },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const purchaseSchema = new Schema<IPurchase>(
  {
    ...baseSchemaFields,
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    items: { type: [purchaseItemSchema], default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, required: true },
    invoiceNo: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(PurchaseStatus),
      default: PurchaseStatus.PENDING,
    },
  },
  baseSchemaOptions
);

addBaseIndexes(purchaseSchema);
purchaseSchema.index({ schoolId: 1, invoiceNo: 1 }, { unique: true });
purchaseSchema.index({ schoolId: 1, vendorId: 1 });
purchaseSchema.index({ schoolId: 1, purchaseDate: -1 });

export const Purchase = model<IPurchase>('Purchase', purchaseSchema);
