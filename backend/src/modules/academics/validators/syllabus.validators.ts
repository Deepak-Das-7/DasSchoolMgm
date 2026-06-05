import { z } from 'zod';
import { objectIdSchema, paginationQuerySchema } from './common.validators';

const topicSchema = z.object({
  title: z.string().min(1).trim(),
  description: z.string().trim().optional(),
  order: z.coerce.number().int().min(1),
  duration: z.coerce.number().int().min(1).optional(),
});

export const createSyllabusSchema = z.object({
  subjectId: objectIdSchema,
  classId: objectIdSchema,
  topics: z.array(topicSchema).optional(),
});

export const updateSyllabusSchema = z.object({
  topics: z.array(topicSchema).min(1),
});

export const listSyllabusQuerySchema = paginationQuerySchema.extend({
  subjectId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
});
