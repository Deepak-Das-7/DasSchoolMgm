import { z } from 'zod';
import { SchoolStatus } from '../../../database/models';

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pincode: z.string().min(1, 'Pincode is required'),
});

const subscriptionSchema = z
  .object({
    plan: z.string().min(1, 'Plan is required'),
    status: z.string().min(1, 'Status is required'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    maxStudents: z.coerce.number().positive().optional(),
    maxStaff: z.coerce.number().positive().optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

const brandingSchema = z.object({
  logo: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  theme: z.enum(['light', 'dark']).optional(),
});

const settingsSchema = z.object({
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
  academicYearStart: z.coerce.number().min(1).max(12).optional(),
  enableSms: z.boolean().optional(),
  enableEmail: z.boolean().optional(),
}).passthrough();

export const createSchoolSchema = z.object({
  name: z.string().min(2, 'School name must be at least 2 characters'),
  code: z
    .string()
    .min(2, 'School code must be at least 2 characters')
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: addressSchema,
  subscription: subscriptionSchema.optional(),
  branding: brandingSchema.optional(),
  domain: z.string().optional(),
  settings: settingsSchema.optional(),
  status: z.nativeEnum(SchoolStatus).optional(),
});

export const updateSchoolSchema = createSchoolSchema.partial();

export const schoolIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID'),
});

export const updateSubscriptionSchema = subscriptionSchema;

export const updateBrandingSchema = brandingSchema;

export const updateSettingsSchema = settingsSchema;

export const listSchoolsQuerySchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  status: z.nativeEnum(SchoolStatus).optional(),
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type ListSchoolsQuery = z.infer<typeof listSchoolsQuerySchema>;
