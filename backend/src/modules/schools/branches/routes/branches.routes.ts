import { Router } from 'express';
import { requirePermission } from '../../../../middlewares/rbac.middleware';
import { validate } from '../../../../middlewares/validate.middleware';
import { branchesController } from '../controllers/branches.controller';
import {
  branchIdParamSchema,
  createBranchSchema,
  listBranchesQuerySchema,
  updateBranchSchema,
} from '../validators/branches.validators';

const router = Router();

router.post(
  '/',
  requirePermission('school:write'),
  validate(createBranchSchema),
  branchesController.create.bind(branchesController)
);
router.get(
  '/',
  requirePermission('school:read'),
  validate(listBranchesQuerySchema, 'query'),
  branchesController.list.bind(branchesController)
);
router.get(
  '/:id',
  requirePermission('school:read'),
  validate(branchIdParamSchema, 'params'),
  branchesController.getById.bind(branchesController)
);
router.put(
  '/:id',
  requirePermission('school:write'),
  validate(branchIdParamSchema, 'params'),
  validate(updateBranchSchema),
  branchesController.update.bind(branchesController)
);
router.delete(
  '/:id',
  requirePermission('school:write'),
  validate(branchIdParamSchema, 'params'),
  branchesController.remove.bind(branchesController)
);

export default router;
