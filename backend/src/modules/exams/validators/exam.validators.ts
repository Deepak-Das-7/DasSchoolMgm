import { z } from 'zod';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const examSubjectSchema = z.object({
  subjectId: objectIdSchema,
  maxMarks: z.coerce.number().min(0),
  passingMarks: z.coerce.number().min(0),
});

const examBaseSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  type: z.string().min(1).max(50).trim(),
  classId: objectIdSchema,
  sessionId: objectIdSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  subjects: z.array(examSubjectSchema).optional(),
  maxMarks: z.coerce.number().min(0),
  passingMarks: z.coerce.number().min(0),
});

export const createExamSchema = examBaseSchema.refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

export const updateExamSchema = examBaseSchema.partial();

export const listExamQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  classId: objectIdSchema.optional(),
  sessionId: objectIdSchema.optional(),
});

export const idParamSchema = z.object({
  id: objectIdSchema,
});

export const marksEntrySchema = z.object({
  entries: z.array(
    z.object({
      studentId: objectIdSchema,
      subjectId: objectIdSchema,
      marksObtained: z.coerce.number().min(0),
      remarks: z.string().trim().optional(),
    })
  ).min(1),
});

export const reportCardParamsSchema = z.object({
  id: objectIdSchema,
  studentId: objectIdSchema,
});
