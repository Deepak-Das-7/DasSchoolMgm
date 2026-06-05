import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
}

export interface IAuditChange {
  field: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export interface IAuditLog extends Document, BaseDocumentFields {
  action: AuditAction;
  entity: string;
  entityId: Types.ObjectId;
  userId: Types.ObjectId;
  ip?: string;
  userAgent?: string;
  changes: IAuditChange[];
  metadata: Record<string, unknown>;
}

const auditChangeSchema = new Schema<IAuditChange>(
  {
    field: { type: String, required: true, trim: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const auditLogSchema = new Schema<IAuditLog>(
  {
    ...baseSchemaFields,
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
    },
    entity: { type: String, required: true, trim: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    changes: { type: [auditChangeSchema], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  baseSchemaOptions
);

addBaseIndexes(auditLogSchema);
auditLogSchema.index({ schoolId: 1, entity: 1, entityId: 1 });
auditLogSchema.index({ schoolId: 1, userId: 1, createdAt: -1 });
auditLogSchema.index({ schoolId: 1, action: 1, createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
