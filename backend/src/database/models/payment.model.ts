import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  UPI = 'upi',
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
  ONLINE = 'online',
}

export interface IPayment extends Document, BaseDocumentFields {
  studentId: Types.ObjectId;
  feeStructureId: Types.ObjectId;
  amount: number;
  paidAmount: number;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  receiptNo?: string;
}

const paymentSchema = new Schema<IPayment>(
  {
    ...baseSchemaFields,
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    feeStructureId: { type: Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
    amount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
    },
    transactionId: { type: String, trim: true, sparse: true },
    receiptNo: { type: String, trim: true, sparse: true },
  },
  baseSchemaOptions
);

addBaseIndexes(paymentSchema);
paymentSchema.index({ schoolId: 1, studentId: 1, status: 1 });
paymentSchema.index({ schoolId: 1, receiptNo: 1 }, { sparse: true });
paymentSchema.index({ feeStructureId: 1 });

export const Payment = model<IPayment>('Payment', paymentSchema);
