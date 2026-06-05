import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface IRouteStop {
  name: string;
  location: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  order: number;
  pickupTime?: string;
  dropTime?: string;
}

export interface IRoute extends Document, BaseDocumentFields {
  name: string;
  vehicleId: Types.ObjectId;
  stops: IRouteStop[];
  startTime: string;
  endTime: string;
  fare: number;
}

const routeStopSchema = new Schema<IRouteStop>(
  {
    name: { type: String, required: true, trim: true },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String, trim: true },
    },
    order: { type: Number, required: true },
    pickupTime: { type: String, trim: true },
    dropTime: { type: String, trim: true },
  },
  { _id: true }
);

const routeSchema = new Schema<IRoute>(
  {
    ...baseSchemaFields,
    name: { type: String, required: true, trim: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    stops: { type: [routeStopSchema], default: [] },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    fare: { type: Number, required: true, min: 0 },
  },
  baseSchemaOptions
);

addBaseIndexes(routeSchema);
routeSchema.index({ schoolId: 1, name: 1 });
routeSchema.index({ vehicleId: 1 });

export const Route = model<IRoute>('Route', routeSchema);
