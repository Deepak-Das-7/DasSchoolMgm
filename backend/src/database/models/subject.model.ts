import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum SubjectType {
  CORE = 'core',
  ELECTIVE = 'elective',
}

export interface ISubject extends Document, BaseDocumentFields {
  name: string;
  code: string;
  type: SubjectType;
  classIds: Types.ObjectId[];
}

const subjectSchema = new Schema<ISubject>(
  {
    ...baseSchemaFields,
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    type: {
      type: String,
      enum: Object.values(SubjectType),
      default: SubjectType.CORE,
    },
    classIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
  },
  baseSchemaOptions
);

addBaseIndexes(subjectSchema);
subjectSchema.index({ schoolId: 1, code: 1 }, { unique: true });
subjectSchema.index({ classIds: 1 });

export const Subject = model<ISubject>('Subject', subjectSchema);
