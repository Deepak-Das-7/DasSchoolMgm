import { z } from 'zod';
import { objectIdSchema, paginationQuerySchema } from './common.validators';

export const createClassSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  numericOrder: z.coerce.number().int().min(1),
  sessionId: objectIdSchema,
});

export const updateClassSchema = createClassSchema.partial();

export const listClassQuerySchema = paginationQuerySchema.extend({
  sessionId: objectIdSchema.optional(),
});
