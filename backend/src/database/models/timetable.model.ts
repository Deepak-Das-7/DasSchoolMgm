import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum WeekDay {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

export interface ITimetablePeriod {
  subjectId: Types.ObjectId;
  teacherId: Types.ObjectId;
  startTime: string;
  endTime: string;
}

export interface ITimetable extends Document, BaseDocumentFields {
  classId: Types.ObjectId;
  sectionId: Types.ObjectId;
  day: WeekDay;
  periods: ITimetablePeriod[];
}

const periodSchema = new Schema<ITimetablePeriod>(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
  },
  { _id: true }
);

const timetableSchema = new Schema<ITimetable>(
  {
    ...baseSchemaFields,
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    day: {
      type: String,
      enum: Object.values(WeekDay),
      required: true,
    },
    periods: { type: [periodSchema], default: [] },
  },
  baseSchemaOptions
);

addBaseIndexes(timetableSchema);
timetableSchema.index(
  { schoolId: 1, classId: 1, sectionId: 1, day: 1 },
  { unique: true }
);
timetableSchema.index({ 'periods.teacherId': 1 });

export const Timetable = model<ITimetable>('Timetable', timetableSchema);
