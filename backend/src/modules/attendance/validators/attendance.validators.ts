import { z } from 'zod';
import {
  AttendanceEntityType,
  AttendanceStatus,
} from '../../../database/models/attendance.model';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const attendanceEntrySchema = z.object({
  entityId: objectIdSchema,
  entityType: z.nativeEnum(AttendanceEntityType),
  status: z.nativeEnum(AttendanceStatus),
  remarks: z.string().trim().optional(),
});

export const markAttendanceSchema = z.object({
  date: z.coerce.date(),
  entries: z.array(attendanceEntrySchema).min(1),
});

export const listAttendanceQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  date: z.coerce.date().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  entityType: z.nativeEnum(AttendanceEntityType).optional(),
  entityId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  sectionId: objectIdSchema.optional(),
});

export const monthlyReportQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
  entityType: z.nativeEnum(AttendanceEntityType),
  entityId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  sectionId: objectIdSchema.optional(),
});

export const summaryReportQuerySchema = z.object({
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
  entityType: z.nativeEnum(AttendanceEntityType),
  entityId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  sectionId: objectIdSchema.optional(),
});
