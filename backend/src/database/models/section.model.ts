import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface ISection extends Document, BaseDocumentFields {
  name: string;
  classId: Types.ObjectId;
  capacity: number;
  classTeacherId?: Types.ObjectId;
}

const sectionSchema = new Schema<ISection>(
  {
    ...baseSchemaFields,
    name: { type: String, required: true, trim: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    capacity: { type: Number, required: true, min: 1 },
    classTeacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  },
  baseSchemaOptions
);

addBaseIndexes(sectionSchema);
sectionSchema.index({ schoolId: 1, classId: 1, name: 1 }, { unique: true });
sectionSchema.index({ classTeacherId: 1 });

export const Section = model<ISection>('Section', sectionSchema);
