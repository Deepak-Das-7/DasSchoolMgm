import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface IEvent extends Document, BaseDocumentFields {
  title: string;
  description: string;
  type: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  targetRoles: string[];
}

const eventSchema = new Schema<IEvent>(
  {
    ...baseSchemaFields,
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, trim: true },
    targetRoles: { type: [String], default: [] },
  },
  baseSchemaOptions
);

addBaseIndexes(eventSchema);
eventSchema.index({ schoolId: 1, startDate: 1, endDate: 1 });
eventSchema.index({ schoolId: 1, type: 1 });
eventSchema.index({ schoolId: 1, targetRoles: 1 });

export const Event = model<IEvent>('Event', eventSchema);
