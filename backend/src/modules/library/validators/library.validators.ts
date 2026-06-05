import { z } from 'zod';
import { objectIdSchema, paginationQuerySchema } from '../../../shared/validators/common.validators';

export const createBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().optional(),
  category: z.string().min(1),
  barcode: z.string().optional(),
  totalCopies: z.number().int().positive().default(1),
  shelfLocation: z.string().optional(),
});

export const updateBookSchema = createBookSchema.partial();

export const issueBookSchema = z.object({
  bookId: objectIdSchema,
  studentId: objectIdSchema,
  dueDate: z.coerce.date(),
});

export const listBooksQuerySchema = paginationQuerySchema.extend({
  category: z.string().optional(),
});
