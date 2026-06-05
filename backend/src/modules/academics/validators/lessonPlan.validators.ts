import { z } from 'zod';
import { objectIdSchema, paginationQuerySchema } from './common.validators';

export const createLessonPlanSchema = z.object({
  subjectId: objectIdSchema,
  classId: objectIdSchema,
  sectionId: objectIdSchema,
  teacherId: objectIdSchema,
  title: z.string().min(1).max(200).trim(),
  content: z.string().min(1),
  date: z.coerce.date(),
});

export const updateLessonPlanSchema = createLessonPlanSchema.partial();

export const listLessonPlanQuerySchema = paginationQuerySchema.extend({
  subjectId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  sectionId: objectIdSchema.optional(),
  teacherId: objectIdSchema.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});
