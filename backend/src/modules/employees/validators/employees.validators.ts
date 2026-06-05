import { z } from 'zod';
import { EmployeeStatus } from '../../../database/models/employee.model';
import {
  idParamSchema,
  objectIdSchema,
  paginationQuerySchema,
} from '../../../shared/validators/common.validators';

export const listEmployeesQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(EmployeeStatus).optional(),
  departmentId: objectIdSchema.optional(),
});

export const createEmployeeSchema = z.object({
  employeeId: z.string().trim().min(1),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().email().trim().toLowerCase(),
  phone: z.string().trim().min(1),
  departmentId: objectIdSchema,
  designation: z.string().trim().min(1),
  joiningDate: z.coerce.date(),
  salary: z.coerce.number().min(0),
  status: z.nativeEnum(EmployeeStatus).optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export { idParamSchema };
