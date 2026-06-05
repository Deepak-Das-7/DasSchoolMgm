import { z } from 'zod';
import { TeacherStatus } from '../../../database/models/teacher.model';
import {
  idParamSchema,
  objectIdSchema,
  paginationQuerySchema,
} from '../../../shared/validators/common.validators';

const qualificationSchema = z.object({
  degree: z.string().trim().min(1),
  institution: z.string().trim().min(1),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
});

export const listTeachersQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(TeacherStatus).optional(),
});

export const createTeacherSchema = z.object({
  employeeId: z.string().trim().min(1),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().email().trim().toLowerCase(),
  phone: z.string().trim().min(1),
  qualifications: z.array(qualificationSchema).optional(),
  subjects: z.array(objectIdSchema).optional(),
  classIds: z.array(objectIdSchema).optional(),
  salary: z.coerce.number().min(0),
  joiningDate: z.coerce.date(),
  status: z.nativeEnum(TeacherStatus).optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial();

export const teacherAttendanceQuerySchema = paginationQuerySchema.extend({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const teacherLeaveQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export { idParamSchema };
