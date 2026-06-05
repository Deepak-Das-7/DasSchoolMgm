import { z } from 'zod';
import { WeekDay } from '../../../database/models/timetable.model';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const periodSchema = z.object({
  subjectId: objectIdSchema,
  teacherId: objectIdSchema,
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
});

export const createTimetableSchema = z.object({
  classId: objectIdSchema,
  sectionId: objectIdSchema,
  day: z.nativeEnum(WeekDay),
  periods: z.array(periodSchema).min(1),
});

export const updateTimetableSchema = z.object({
  classId: objectIdSchema.optional(),
  sectionId: objectIdSchema.optional(),
  day: z.nativeEnum(WeekDay).optional(),
  periods: z.array(periodSchema).min(1).optional(),
});

export const listTimetableQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  classId: objectIdSchema.optional(),
  sectionId: objectIdSchema.optional(),
  day: z.nativeEnum(WeekDay).optional(),
});

export const idParamSchema = z.object({
  id: objectIdSchema,
});

const dayScheduleSchema = z.object({
  day: z.nativeEnum(WeekDay),
  periods: z.array(periodSchema).min(1),
});

export const generateTimetableSchema = z.object({
  classId: objectIdSchema,
  sectionId: objectIdSchema,
  schedule: z.array(dayScheduleSchema).min(1),
});

export const conflictsQuerySchema = z.object({
  classId: objectIdSchema.optional(),
  sectionId: objectIdSchema.optional(),
});
