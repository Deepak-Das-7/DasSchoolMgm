import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum IssuedBookStatus {
  ISSUED = 'issued',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost',
}

export interface IIssuedBook extends Document, BaseDocumentFields {
  bookId: Types.ObjectId;
  studentId: Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  returnDate?: Date;
  fine: number;
  status: IssuedBookStatus;
}

const issuedBookSchema = new Schema<IIssuedBook>(
  {
    ...baseSchemaFields,
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    fine: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: Object.values(IssuedBookStatus),
      default: IssuedBookStatus.ISSUED,
    },
  },
  baseSchemaOptions
);

addBaseIndexes(issuedBookSchema);
issuedBookSchema.index({ schoolId: 1, bookId: 1, status: 1 });
issuedBookSchema.index({ schoolId: 1, studentId: 1, status: 1 });
issuedBookSchema.index({ schoolId: 1, dueDate: 1, status: 1 });

export const IssuedBook = model<IIssuedBook>('IssuedBook', issuedBookSchema);
