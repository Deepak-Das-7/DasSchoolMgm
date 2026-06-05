import { Schema, Types } from 'mongoose';

export const baseSchemaFields = {
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    index: true,
    default: null,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
};

export const baseSchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    },
  },
};

export function addBaseIndexes(schema: Schema): void {
  schema.index({ schoolId: 1, isDeleted: 1 });
  schema.index({ schoolId: 1, createdAt: -1 });
}

export type BaseDocumentFields = {
  schoolId: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
