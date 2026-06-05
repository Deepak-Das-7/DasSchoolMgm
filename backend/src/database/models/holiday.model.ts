import { Schema, model, Document } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum HolidayType {
  NATIONAL = 'national',
  REGIONAL = 'regional',
  SCHOOL = 'school',
  OPTIONAL = 'optional',
}

export interface IHoliday extends Document, BaseDocumentFields {
  name: string;
  date: Date;
  type: HolidayType;
  description?: string;
}

const holidaySchema = new Schema<IHoliday>(
  {
    ...baseSchemaFields,
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: Object.values(HolidayType),
      default: HolidayType.SCHOOL,
    },
    description: { type: String, trim: true },
  },
  baseSchemaOptions
);

addBaseIndexes(holidaySchema);
holidaySchema.index({ schoolId: 1, date: 1 });
holidaySchema.index({ schoolId: 1, type: 1 });

export const Holiday = model<IHoliday>('Holiday', holidaySchema);
