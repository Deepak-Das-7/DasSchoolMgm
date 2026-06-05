import { Schema, model, Document, Types, models } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../../database/base.schema';

export interface IAuditLog extends Document, BaseDocumentFields {
  action: string;
  entity: string;
  entityId?: string;
  userId: Types.ObjectId;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    ...baseSchemaFields,
    action: { type: String, required: true, trim: true },
    entity: { type: String, required: true, trim: true },
    entityId: { type: String, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed },
  },
  baseSchemaOptions
);

addBaseIndexes(auditLogSchema);
auditLogSchema.index({ schoolId: 1, entity: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });

// export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
export const AuditLog = models.AuditLog || model<IAuditLog>('AuditLog', auditLogSchema);
