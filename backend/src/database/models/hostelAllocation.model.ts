import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface IHostelAllocation extends Document, BaseDocumentFields {
  studentId: Types.ObjectId;
  roomId: Types.ObjectId;
  bedNo: string;
  checkInDate: Date;
  checkOutDate?: Date;
}

const hostelAllocationSchema = new Schema<IHostelAllocation>(
  {
    ...baseSchemaFields,
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'HostelRoom', required: true },
    bedNo: { type: String, required: true, trim: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date },
  },
  baseSchemaOptions
);

addBaseIndexes(hostelAllocationSchema);
hostelAllocationSchema.index({ schoolId: 1, studentId: 1 });
hostelAllocationSchema.index({ schoolId: 1, roomId: 1, bedNo: 1 });
hostelAllocationSchema.index({ schoolId: 1, checkOutDate: 1 });

export const HostelAllocation = model<IHostelAllocation>('HostelAllocation', hostelAllocationSchema);
