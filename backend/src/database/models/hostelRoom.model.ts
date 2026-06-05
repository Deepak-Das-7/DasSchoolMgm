import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface IHostelRoom extends Document, BaseDocumentFields {
  buildingId: Types.ObjectId;
  roomNo: string;
  floor: number;
  capacity: number;
  type: string;
  occupied: number;
}

const hostelRoomSchema = new Schema<IHostelRoom>(
  {
    ...baseSchemaFields,
    buildingId: { type: Schema.Types.ObjectId, ref: 'HostelBuilding', required: true },
    roomNo: { type: String, required: true, trim: true },
    floor: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    type: { type: String, required: true, trim: true },
    occupied: { type: Number, default: 0, min: 0 },
  },
  baseSchemaOptions
);

addBaseIndexes(hostelRoomSchema);
hostelRoomSchema.index({ schoolId: 1, buildingId: 1, roomNo: 1 }, { unique: true });
hostelRoomSchema.index({ buildingId: 1, floor: 1 });

export const HostelRoom = model<IHostelRoom>('HostelRoom', hostelRoomSchema);
