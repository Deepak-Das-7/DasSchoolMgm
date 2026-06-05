import { Router } from 'express';
import { requirePermission } from '../../../../middlewares/rbac.middleware';
import { validate } from '../../../../middlewares/validate.middleware';
import { academicSessionsController } from '../controllers/academic-sessions.controller';
import {
  academicSessionIdParamSchema,
  createAcademicSessionSchema,
  listAcademicSessionsQuerySchema,
  updateAcademicSessionSchema,
} from '../validators/academic-sessions.validators';

const router = Router();

router.post(
  '/',
  requirePermission('school:write', 'academics:write'),
  validate(createAcademicSessionSchema),
  academicSessionsController.create.bind(academicSessionsController)
);
router.get(
  '/',
  requirePermission('school:read', 'academics:read'),
  validate(listAcademicSessionsQuerySchema, 'query'),
  academicSessionsController.list.bind(academicSessionsController)
);
router.get(
  '/:id',
  requirePermission('school:read', 'academics:read'),
  validate(academicSessionIdParamSchema, 'params'),
  academicSessionsController.getById.bind(academicSessionsController)
);
router.put(
  '/:id',
  requirePermission('school:write', 'academics:write'),
  validate(academicSessionIdParamSchema, 'params'),
  validate(updateAcademicSessionSchema),
  academicSessionsController.update.bind(academicSessionsController)
);
router.delete(
  '/:id',
  requirePermission('school:write', 'academics:write'),
  validate(academicSessionIdParamSchema, 'params'),
  academicSessionsController.remove.bind(academicSessionsController)
);

export default router;
