import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface IHostelBuilding extends Document, BaseDocumentFields {
  name: string;
  type: string;
  floors: number;
  wardenId?: Types.ObjectId;
}

const hostelBuildingSchema = new Schema<IHostelBuilding>(
  {
    ...baseSchemaFields,
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    floors: { type: Number, required: true, min: 1 },
    wardenId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  },
  baseSchemaOptions
);

addBaseIndexes(hostelBuildingSchema);
hostelBuildingSchema.index({ schoolId: 1, name: 1 }, { unique: true });
hostelBuildingSchema.index({ wardenId: 1 }, { sparse: true });

export const HostelBuilding = model<IHostelBuilding>('HostelBuilding', hostelBuildingSchema);
