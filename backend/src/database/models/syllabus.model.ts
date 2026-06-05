import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface ISyllabusTopic {
  title: string;
  description?: string;
  order: number;
  duration?: number;
}

export interface ISyllabus extends Document, BaseDocumentFields {
  subjectId: Types.ObjectId;
  classId: Types.ObjectId;
  topics: ISyllabusTopic[];
}

const topicSchema = new Schema<ISyllabusTopic>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    order: { type: Number, required: true },
    duration: { type: Number },
  },
  { _id: true }
);

const syllabusSchema = new Schema<ISyllabus>(
  {
    ...baseSchemaFields,
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    topics: { type: [topicSchema], default: [] },
  },
  baseSchemaOptions
);

addBaseIndexes(syllabusSchema);
syllabusSchema.index({ schoolId: 1, subjectId: 1, classId: 1 }, { unique: true });

export const Syllabus = model<ISyllabus>('Syllabus', syllabusSchema);
