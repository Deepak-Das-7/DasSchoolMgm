import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import {
  markAttendanceSchema,
  listAttendanceQuerySchema,
  monthlyReportQuerySchema,
  summaryReportQuerySchema,
} from '../validators/attendance.validators';
import { attendanceController } from '../controllers/attendance.controller';

const router = Router();

router.use(authenticate, requireSchoolContext);

router.post(
  '/mark',
  requirePermission('attendance:write'),
  validate(markAttendanceSchema),
  attendanceController.mark
);

router.get(
  '/',
  requirePermission('attendance:read'),
  validate(listAttendanceQuerySchema, 'query'),
  attendanceController.list
);

router.get(
  '/report/monthly',
  requirePermission('attendance:read'),
  validate(monthlyReportQuerySchema, 'query'),
  attendanceController.monthlyReport
);

router.get(
  '/report/summary',
  requirePermission('attendance:read'),
  validate(summaryReportQuerySchema, 'query'),
  attendanceController.summaryReport
);

export default router;
