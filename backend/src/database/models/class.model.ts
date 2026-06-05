import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface IClass extends Document, BaseDocumentFields {
  name: string;
  numericOrder: number;
  sessionId: Types.ObjectId;
}

const classSchema = new Schema<IClass>(
  {
    ...baseSchemaFields,
    name: { type: String, required: true, trim: true },
    numericOrder: { type: Number, required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'AcademicSession', required: true },
  },
  baseSchemaOptions
);

addBaseIndexes(classSchema);
classSchema.index({ schoolId: 1, sessionId: 1, name: 1 }, { unique: true });
classSchema.index({ schoolId: 1, sessionId: 1, numericOrder: 1 });

export const Class = model<IClass>('Class', classSchema);
