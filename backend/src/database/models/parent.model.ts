import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface IParent extends Document, BaseDocumentFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  occupation?: string;
  studentIds: Types.ObjectId[];
  userId?: Types.ObjectId;
}

const parentSchema = new Schema<IParent>(
  {
    ...baseSchemaFields,
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    occupation: { type: String, trim: true },
    studentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  baseSchemaOptions
);

addBaseIndexes(parentSchema);
parentSchema.index({ schoolId: 1, email: 1 });
parentSchema.index({ schoolId: 1, phone: 1 });
parentSchema.index({ studentIds: 1 });
parentSchema.index({ userId: 1 }, { sparse: true });

export const Parent = model<IParent>('Parent', parentSchema);
