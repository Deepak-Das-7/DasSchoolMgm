import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface IEmailTemplate extends Document, BaseDocumentFields {
  name: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

const emailTemplateSchema = new Schema<IEmailTemplate>({
  ...baseSchemaFields,
  name: { type: String, required: true, trim: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  variables: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, baseSchemaOptions);

addBaseIndexes(emailTemplateSchema);
emailTemplateSchema.index({ schoolId: 1, name: 1 });

export const EmailTemplate = model<IEmailTemplate>('EmailTemplate', emailTemplateSchema);
