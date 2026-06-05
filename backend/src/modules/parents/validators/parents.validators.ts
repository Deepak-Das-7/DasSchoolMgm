import { z } from 'zod';
import { idParamSchema, objectIdSchema, paginationQuerySchema } from '../../../shared/validators/common.validators';

export const listParentsQuerySchema = paginationQuerySchema;

export const createParentSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().email().trim().toLowerCase(),
  phone: z.string().trim().min(1),
  occupation: z.string().trim().optional(),
  studentIds: z.array(objectIdSchema).optional(),
  userId: objectIdSchema.optional(),
});

export const updateParentSchema = createParentSchema.partial();

export const linkStudentSchema = z.object({
  studentId: objectIdSchema,
});

export { idParamSchema };
