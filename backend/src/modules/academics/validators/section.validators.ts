import { z } from 'zod';
import { objectIdSchema, paginationQuerySchema } from './common.validators';

export const createSectionSchema = z.object({
  name: z.string().min(1).max(50).trim(),
  classId: objectIdSchema,
  capacity: z.coerce.number().int().min(1),
  classTeacherId: objectIdSchema.optional(),
});

export const updateSectionSchema = createSectionSchema.partial();

export const listSectionQuerySchema = paginationQuerySchema.extend({
  classId: objectIdSchema.optional(),
});
