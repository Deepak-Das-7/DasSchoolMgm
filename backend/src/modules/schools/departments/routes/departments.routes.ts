import { Router } from 'express';
import { requirePermission } from '../../../../middlewares/rbac.middleware';
import { validate } from '../../../../middlewares/validate.middleware';
import { departmentsController } from '../controllers/departments.controller';
import {
  createDepartmentSchema,
  departmentIdParamSchema,
  listDepartmentsQuerySchema,
  updateDepartmentSchema,
} from '../validators/departments.validators';

const router = Router();

router.post(
  '/',
  requirePermission('school:write'),
  validate(createDepartmentSchema),
  departmentsController.create.bind(departmentsController)
);
router.get(
  '/',
  requirePermission('school:read'),
  validate(listDepartmentsQuerySchema, 'query'),
  departmentsController.list.bind(departmentsController)
);
router.get(
  '/:id',
  requirePermission('school:read'),
  validate(departmentIdParamSchema, 'params'),
  departmentsController.getById.bind(departmentsController)
);
router.put(
  '/:id',
  requirePermission('school:write'),
  validate(departmentIdParamSchema, 'params'),
  validate(updateDepartmentSchema),
  departmentsController.update.bind(departmentsController)
);
router.delete(
  '/:id',
  requirePermission('school:write'),
  validate(departmentIdParamSchema, 'params'),
  departmentsController.remove.bind(departmentsController)
);

export default router;
