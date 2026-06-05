import { z } from 'zod';
import { DepartmentStatus } from '../../../../database/models';

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  code: z
    .string()
    .min(2, 'Department code must be at least 2 characters')
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric'),
  description: z.string().optional(),
  headId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid head ID').optional(),
  status: z.nativeEnum(DepartmentStatus).optional(),
  schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const departmentIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid department ID'),
});

export const listDepartmentsQuerySchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  status: z.nativeEnum(DepartmentStatus).optional(),
  schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type ListDepartmentsQuery = z.infer<typeof listDepartmentsQuerySchema>;
