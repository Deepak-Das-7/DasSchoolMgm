import { z } from 'zod';
import { DiscountType } from '../../../database/models/feeDiscount.model';
import { FineType } from '../../../database/models/fineRule.model';
import { PaymentMethod } from '../../../database/models/payment.model';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const feeComponentSchema = z.object({
  name: z.string().min(1).trim(),
  amount: z.coerce.number().min(0),
  description: z.string().trim().optional(),
});

export const createFeeStructureSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  classId: objectIdSchema,
  sessionId: objectIdSchema,
  components: z.array(feeComponentSchema).min(1),
  totalAmount: z.coerce.number().min(0),
  dueDate: z.coerce.date(),
});

export const updateFeeStructureSchema = createFeeStructureSchema.partial();

export const listFeeStructureQuerySchema = z.object({
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

export const recordPaymentSchema = z.object({
  studentId: objectIdSchema,
  feeStructureId: objectIdSchema,
  amount: z.coerce.number().min(0),
  paidAmount: z.coerce.number().min(0),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  transactionId: z.string().trim().optional(),
  discountId: objectIdSchema.optional(),
  scholarshipId: objectIdSchema.optional(),
});

export const listPaymentsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  studentId: objectIdSchema.optional(),
  feeStructureId: objectIdSchema.optional(),
  status: z.enum(['pending', 'partial', 'paid', 'overdue', 'refunded']).optional(),
});

export const createDiscountSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  type: z.nativeEnum(DiscountType),
  value: z.coerce.number().min(0),
  classIds: z.array(objectIdSchema).optional(),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
  description: z.string().trim().optional(),
});

export const createScholarshipSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  type: z.nativeEnum(DiscountType),
  value: z.coerce.number().min(0),
  criteria: z.string().trim().optional(),
  maxRecipients: z.coerce.number().int().min(1).optional(),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});

export const createFineRuleSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  type: z.nativeEnum(FineType),
  value: z.coerce.number().min(0),
  gracePeriodDays: z.coerce.number().int().min(0).optional(),
  applicableComponents: z.array(z.string().trim()).optional(),
  isActive: z.boolean().optional(),
  description: z.string().trim().optional(),
});
