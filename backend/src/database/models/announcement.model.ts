import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum AnnouncementPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface IAnnouncement extends Document, BaseDocumentFields {
  title: string;
  content: string;
  targetRoles: string[];
  priority: AnnouncementPriority;
  publishDate: Date;
  expiryDate?: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    ...baseSchemaFields,
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    targetRoles: { type: [String], default: [] },
    priority: {
      type: String,
      enum: Object.values(AnnouncementPriority),
      default: AnnouncementPriority.MEDIUM,
    },
    publishDate: { type: Date, required: true },
    expiryDate: { type: Date },
  },
  baseSchemaOptions
);

addBaseIndexes(announcementSchema);
announcementSchema.index({ schoolId: 1, publishDate: -1 });
announcementSchema.index({ schoolId: 1, targetRoles: 1 });
announcementSchema.index({ schoolId: 1, expiryDate: 1 });

export const Announcement = model<IAnnouncement>('Announcement', announcementSchema);
