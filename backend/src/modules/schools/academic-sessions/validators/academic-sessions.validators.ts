import { z } from 'zod';

const academicSessionBaseSchema = z.object({
  name: z.string().min(2, 'Session name must be at least 2 characters'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isCurrent: z.boolean().optional(),
  schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
});

export const createAcademicSessionSchema = academicSessionBaseSchema.refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export const updateAcademicSessionSchema = academicSessionBaseSchema.partial();

export const academicSessionIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid session ID'),
});

export const listAcademicSessionsQuerySchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
});

export type CreateAcademicSessionInput = z.infer<typeof createAcademicSessionSchema>;
export type UpdateAcademicSessionInput = z.infer<typeof updateAcademicSessionSchema>;
export type ListAcademicSessionsQuery = z.infer<typeof listAcademicSessionsQuerySchema>;
