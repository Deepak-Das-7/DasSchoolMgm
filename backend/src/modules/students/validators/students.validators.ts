import { z } from 'zod';
import { Gender, StudentStatus } from '../../../database/models/student.model';
import {
  addressSchema,
  idParamSchema,
  objectIdSchema,
  paginationQuerySchema,
} from '../../../shared/validators/common.validators';

export const listStudentsQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(StudentStatus).optional(),
  classId: objectIdSchema.optional(),
  sectionId: objectIdSchema.optional(),
});

export const createStudentSchema = z.object({
  admissionNo: z.string().trim().min(1).optional(),
  rollNo: z.string().trim().optional(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  gender: z.nativeEnum(Gender),
  dob: z.coerce.date(),
  classId: objectIdSchema,
  sectionId: objectIdSchema,
  parentIds: z.array(objectIdSchema).optional(),
  admissionDate: z.coerce.date().optional(),
  bloodGroup: z.string().trim().optional(),
  address: addressSchema.optional(),
  photo: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial().extend({
  status: z.nativeEnum(StudentStatus).optional(),
});

export const promoteStudentSchema = z.object({
  classId: objectIdSchema,
  sectionId: objectIdSchema,
  rollNo: z.string().trim().optional(),
});

export const transferCertificateSchema = z.object({
  reason: z.string().trim().min(1),
  remarks: z.string().trim().optional(),
  lastAttendanceDate: z.coerce.date().optional(),
});

export const uploadDocumentSchema = z.object({
  name: z.string().trim().min(1),
  type: z.string().trim().min(1),
});

export { idParamSchema };
