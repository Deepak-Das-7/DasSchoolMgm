import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum AssetStatus {
  ACTIVE = 'active',
  IN_USE = 'in_use',
  UNDER_MAINTENANCE = 'under_maintenance',
  DISPOSED = 'disposed',
}

export interface IAsset extends Document, BaseDocumentFields {
  name: string;
  category: string;
  serialNo?: string;
  purchaseDate: Date;
  value: number;
  location: string;
  status: AssetStatus;
}

const assetSchema = new Schema<IAsset>(
  {
    ...baseSchemaFields,
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    serialNo: { type: String, trim: true },
    purchaseDate: { type: Date, required: true },
    value: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(AssetStatus),
      default: AssetStatus.ACTIVE,
    },
  },
  baseSchemaOptions
);

addBaseIndexes(assetSchema);
assetSchema.index({ schoolId: 1, serialNo: 1 }, { sparse: true });
assetSchema.index({ schoolId: 1, category: 1 });
assetSchema.index({ schoolId: 1, status: 1 });

export const Asset = model<IAsset>('Asset', assetSchema);
