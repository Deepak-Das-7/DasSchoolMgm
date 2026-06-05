import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { auditLog } from '../../../middlewares/audit.middleware';
import { teacherController } from '../controllers/teachers.controller';
import {
  createTeacherSchema,
  idParamSchema,
  listTeachersQuerySchema,
  teacherAttendanceQuerySchema,
  teacherLeaveQuerySchema,
  updateTeacherSchema,
} from '../validators/teachers.validators';

const router = Router();

router.use(authenticate, requireSchoolContext);

router.get(
  '/',
  requirePermission('teachers:read'),
  validate(listTeachersQuerySchema, 'query'),
  teacherController.list.bind(teacherController)
);

router.get(
  '/:id',
  requirePermission('teachers:read'),
  validate(idParamSchema, 'params'),
  teacherController.getById.bind(teacherController)
);

router.post(
  '/',
  requirePermission('teachers:write'),
  validate(createTeacherSchema),
  auditLog('create', 'teacher'),
  teacherController.create.bind(teacherController)
);

router.put(
  '/:id',
  requirePermission('teachers:write'),
  validate(idParamSchema, 'params'),
  validate(updateTeacherSchema),
  auditLog('update', 'teacher'),
  teacherController.update.bind(teacherController)
);

router.delete(
  '/:id',
  requirePermission('teachers:write'),
  validate(idParamSchema, 'params'),
  auditLog('delete', 'teacher'),
  teacherController.remove.bind(teacherController)
);

router.get(
  '/:id/attendance',
  requirePermission('attendance:read'),
  validate(idParamSchema, 'params'),
  validate(teacherAttendanceQuerySchema, 'query'),
  teacherController.getAttendance.bind(teacherController)
);

router.get(
  '/:id/leave',
  requirePermission('teachers:read'),
  validate(idParamSchema, 'params'),
  validate(teacherLeaveQuerySchema, 'query'),
  teacherController.getLeave.bind(teacherController)
);

export default router;
