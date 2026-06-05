import { z } from 'zod';
import { objectIdSchema, paginationQuerySchema } from './common.validators';
import { SubjectType } from '../../../database/models/subject.model';

export const createSubjectSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  code: z.string().min(1).max(20).trim().toUpperCase(),
  type: z.nativeEnum(SubjectType).optional(),
  classIds: z.array(objectIdSchema).optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const listSubjectQuerySchema = paginationQuerySchema.extend({
  classId: objectIdSchema.optional(),
  type: z.nativeEnum(SubjectType).optional(),
});
