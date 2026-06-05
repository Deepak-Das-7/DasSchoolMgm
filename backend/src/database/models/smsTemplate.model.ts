import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface ISmsTemplate extends Document, BaseDocumentFields {
  name: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

const smsTemplateSchema = new Schema<ISmsTemplate>({
  ...baseSchemaFields,
  name: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  variables: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, baseSchemaOptions);

addBaseIndexes(smsTemplateSchema);
smsTemplateSchema.index({ schoolId: 1, name: 1 });

export const SmsTemplate = model<ISmsTemplate>('SmsTemplate', smsTemplateSchema);
