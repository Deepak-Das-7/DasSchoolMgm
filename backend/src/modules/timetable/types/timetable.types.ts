import { Types } from 'mongoose';
import { WeekDay } from '../../../database/models/timetable.model';

export interface TimetableConflict {
  type: 'teacher' | 'section' | 'time_overlap';
  day: WeekDay;
  teacherId?: string;
  sectionId?: string;
  timetableIds: Types.ObjectId[];
  message: string;
}

export interface TimetablePeriodInput {
  subjectId: string;
  teacherId: string;
  startTime: string;
  endTime: string;
}

export interface TimetableInput {
  classId: string;
  sectionId: string;
  day: WeekDay;
  periods: TimetablePeriodInput[];
}
