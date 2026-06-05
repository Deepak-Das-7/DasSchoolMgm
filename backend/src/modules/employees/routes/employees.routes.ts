import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { auditLog } from '../../../middlewares/audit.middleware';
import { employeeController } from '../controllers/employees.controller';
import {
  createEmployeeSchema,
  idParamSchema,
  listEmployeesQuerySchema,
  updateEmployeeSchema,
} from '../validators/employees.validators';

const router = Router();

router.use(authenticate, requireSchoolContext);

router.get(
  '/',
  requirePermission('employees:read'),
  validate(listEmployeesQuerySchema, 'query'),
  employeeController.list.bind(employeeController)
);

router.get(
  '/:id',
  requirePermission('employees:read'),
  validate(idParamSchema, 'params'),
  employeeController.getById.bind(employeeController)
);

router.post(
  '/',
  requirePermission('employees:write'),
  validate(createEmployeeSchema),
  auditLog('create', 'employee'),
  employeeController.create.bind(employeeController)
);

router.put(
  '/:id',
  requirePermission('employees:write'),
  validate(idParamSchema, 'params'),
  validate(updateEmployeeSchema),
  auditLog('update', 'employee'),
  employeeController.update.bind(employeeController)
);

router.delete(
  '/:id',
  requirePermission('employees:write'),
  validate(idParamSchema, 'params'),
  auditLog('delete', 'employee'),
  employeeController.remove.bind(employeeController)
);

export default router;
