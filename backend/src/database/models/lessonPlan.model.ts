import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface ILessonPlan extends Document, BaseDocumentFields {
  subjectId: Types.ObjectId;
  classId: Types.ObjectId;
  sectionId: Types.ObjectId;
  teacherId: Types.ObjectId;
  title: string;
  content: string;
  date: Date;
}

const lessonPlanSchema = new Schema<ILessonPlan>(
  {
    ...baseSchemaFields,
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    date: { type: Date, required: true },
  },
  baseSchemaOptions
);

addBaseIndexes(lessonPlanSchema);
lessonPlanSchema.index({ schoolId: 1, teacherId: 1, date: -1 });
lessonPlanSchema.index({ schoolId: 1, classId: 1, sectionId: 1, date: -1 });

export const LessonPlan = model<ILessonPlan>('LessonPlan', lessonPlanSchema);
