import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface IFeeComponent {
  name: string;
  amount: number;
  description?: string;
}

export interface IFeeStructure extends Document, BaseDocumentFields {
  name: string;
  classId: Types.ObjectId;
  sessionId: Types.ObjectId;
  components: IFeeComponent[];
  totalAmount: number;
  dueDate: Date;
}

const feeComponentSchema = new Schema<IFeeComponent>(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
  },
  { _id: true }
);

const feeStructureSchema = new Schema<IFeeStructure>(
  {
    ...baseSchemaFields,
    name: { type: String, required: true, trim: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true },
    components: { type: [feeComponentSchema], default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
  },
  baseSchemaOptions
);

addBaseIndexes(feeStructureSchema);
feeStructureSchema.index({ schoolId: 1, classId: 1, sessionId: 1 });
feeStructureSchema.index({ schoolId: 1, dueDate: 1 });

export const FeeStructure = model<IFeeStructure>('FeeStructure', feeStructureSchema);
