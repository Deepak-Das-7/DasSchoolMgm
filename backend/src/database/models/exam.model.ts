import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface IExamSubject {
  subjectId: Types.ObjectId;
  maxMarks: number;
  passingMarks: number;
}

export interface IExam extends Document, BaseDocumentFields {
  name: string;
  type: string;
  classId: Types.ObjectId;
  sessionId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  subjects: IExamSubject[];
  maxMarks: number;
  passingMarks: number;
}

const examSubjectSchema = new Schema<IExamSubject>(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    maxMarks: { type: Number, required: true, min: 0 },
    passingMarks: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const examSchema = new Schema<IExam>(
  {
    ...baseSchemaFields,
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    subjects: { type: [examSubjectSchema], default: [] },
    maxMarks: { type: Number, required: true, min: 0 },
    passingMarks: { type: Number, required: true, min: 0 },
  },
  baseSchemaOptions
);

addBaseIndexes(examSchema);
examSchema.index({ schoolId: 1, classId: 1, sessionId: 1 });
examSchema.index({ schoolId: 1, startDate: -1 });

export const Exam = model<IExam>('Exam', examSchema);
