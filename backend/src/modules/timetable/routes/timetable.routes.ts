import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import {
  createTimetableSchema,
  updateTimetableSchema,
  listTimetableQuerySchema,
  idParamSchema,
  generateTimetableSchema,
  conflictsQuerySchema,
} from '../validators/timetable.validators';
import { timetableController } from '../controllers/timetable.controller';

const router = Router();

router.use(authenticate, requireSchoolContext);

router
  .route('/')
  .get(
    requirePermission('timetable:read'),
    validate(listTimetableQuerySchema, 'query'),
    timetableController.list
  )
  .post(
    requirePermission('timetable:write'),
    validate(createTimetableSchema),
    timetableController.create
  );

router.get(
  '/conflicts',
  requirePermission('timetable:read'),
  validate(conflictsQuerySchema, 'query'),
  timetableController.conflicts
);

router.post(
  '/generate',
  requirePermission('timetable:write'),
  validate(generateTimetableSchema),
  timetableController.generate
);

router
  .route('/:id')
  .get(
    requirePermission('timetable:read'),
    validate(idParamSchema, 'params'),
    timetableController.getById
  )
  .put(
    requirePermission('timetable:write'),
    validate(idParamSchema, 'params'),
    validate(updateTimetableSchema),
    timetableController.update
  )
  .delete(
    requirePermission('timetable:write'),
    validate(idParamSchema, 'params'),
    timetableController.remove
  );

export default router;
