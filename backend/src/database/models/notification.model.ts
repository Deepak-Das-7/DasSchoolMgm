import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  REMINDER = 'reminder',
}

export interface INotification extends Document, BaseDocumentFields {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
}

const notificationSchema = new Schema<INotification>(
  {
    ...baseSchemaFields,
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      default: NotificationType.INFO,
    },
    isRead: { type: Boolean, default: false },
    link: { type: String, trim: true },
  },
  baseSchemaOptions
);

addBaseIndexes(notificationSchema);
notificationSchema.index({ schoolId: 1, userId: 1, isRead: 1 });
notificationSchema.index({ schoolId: 1, userId: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
