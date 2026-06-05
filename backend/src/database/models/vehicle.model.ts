import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface IVehicle extends Document, BaseDocumentFields {
  registrationNo: string;
  type: string;
  capacity: number;
  driverName: string;
  driverPhone: string;
  gpsDeviceId?: string;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    ...baseSchemaFields,
    registrationNo: { type: String, required: true, uppercase: true, trim: true },
    type: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    driverName: { type: String, required: true, trim: true },
    driverPhone: { type: String, required: true, trim: true },
    gpsDeviceId: { type: String, trim: true },
  },
  baseSchemaOptions
);

addBaseIndexes(vehicleSchema);
vehicleSchema.index({ schoolId: 1, registrationNo: 1 }, { unique: true });

export const Vehicle = model<IVehicle>('Vehicle', vehicleSchema);
