import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { auditLog } from '../../../middlewares/audit.middleware';
import { parentController } from '../controllers/parents.controller';
import {
  createParentSchema,
  idParamSchema,
  linkStudentSchema,
  listParentsQuerySchema,
  updateParentSchema,
} from '../validators/parents.validators';

const router = Router();

router.use(authenticate, requireSchoolContext);

router.get(
  '/',
  requirePermission('parents:read'),
  validate(listParentsQuerySchema, 'query'),
  parentController.list.bind(parentController)
);

router.get(
  '/:id',
  requirePermission('parents:read'),
  validate(idParamSchema, 'params'),
  parentController.getById.bind(parentController)
);

router.post(
  '/',
  requirePermission('parents:write'),
  validate(createParentSchema),
  auditLog('create', 'parent'),
  parentController.create.bind(parentController)
);

router.put(
  '/:id',
  requirePermission('parents:write'),
  validate(idParamSchema, 'params'),
  validate(updateParentSchema),
  auditLog('update', 'parent'),
  parentController.update.bind(parentController)
);

router.delete(
  '/:id',
  requirePermission('parents:write'),
  validate(idParamSchema, 'params'),
  auditLog('delete', 'parent'),
  parentController.remove.bind(parentController)
);

router.get(
  '/:id/children',
  requirePermission('parents:read'),
  validate(idParamSchema, 'params'),
  parentController.getChildren.bind(parentController)
);

router.post(
  '/:id/link-student',
  requirePermission('parents:write'),
  validate(idParamSchema, 'params'),
  validate(linkStudentSchema),
  auditLog('update', 'parent'),
  parentController.linkStudent.bind(parentController)
);

export default router;
