import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface IResult extends Document, BaseDocumentFields {
  examId: Types.ObjectId;
  studentId: Types.ObjectId;
  subjectId: Types.ObjectId;
  marksObtained: number;
  grade?: string;
  remarks?: string;
}

const resultSchema = new Schema<IResult>(
  {
    ...baseSchemaFields,
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    marksObtained: { type: Number, required: true, min: 0 },
    grade: { type: String, trim: true },
    remarks: { type: String, trim: true },
  },
  baseSchemaOptions
);

addBaseIndexes(resultSchema);
resultSchema.index(
  { schoolId: 1, examId: 1, studentId: 1, subjectId: 1 },
  { unique: true }
);
resultSchema.index({ schoolId: 1, studentId: 1 });

export const Result = model<IResult>('Result', resultSchema);
