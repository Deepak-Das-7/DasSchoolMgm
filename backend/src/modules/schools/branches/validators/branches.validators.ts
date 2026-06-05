import { z } from 'zod';
import { BranchStatus } from '../../../../database/models';

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pincode: z.string().min(1, 'Pincode is required'),
});

export const createBranchSchema = z.object({
  name: z.string().min(2, 'Branch name must be at least 2 characters'),
  code: z
    .string()
    .min(2, 'Branch code must be at least 2 characters')
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric'),
  address: addressSchema,
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  isMain: z.boolean().optional(),
  status: z.nativeEnum(BranchStatus).optional(),
  schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
});

export const updateBranchSchema = createBranchSchema.partial();

export const branchIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid branch ID'),
});

export const listBranchesQuerySchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  status: z.nativeEnum(BranchStatus).optional(),
  schoolId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID').optional(),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
export type ListBranchesQuery = z.infer<typeof listBranchesQuerySchema>;
