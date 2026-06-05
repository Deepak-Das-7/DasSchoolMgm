import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import {
  createExamSchema,
  updateExamSchema,
  listExamQuerySchema,
  idParamSchema,
  marksEntrySchema,
  reportCardParamsSchema,
} from '../validators/exam.validators';
import { examController } from '../controllers/exam.controller';

const router = Router();

router.use(authenticate, requireSchoolContext);

router
  .route('/')
  .get(requirePermission('exams:read'), validate(listExamQuerySchema, 'query'), examController.list)
  .post(requirePermission('exams:write'), validate(createExamSchema), examController.create);

router
  .route('/:id')
  .get(requirePermission('exams:read'), validate(idParamSchema, 'params'), examController.getById)
  .put(
    requirePermission('exams:write'),
    validate(idParamSchema, 'params'),
    validate(updateExamSchema),
    examController.update
  )
  .delete(
    requirePermission('exams:write'),
    validate(idParamSchema, 'params'),
    examController.remove
  );

router.post(
  '/:id/marks',
  requirePermission('exams:write'),
  validate(idParamSchema, 'params'),
  validate(marksEntrySchema),
  examController.enterMarks
);

router.post(
  '/:id/calculate-grades',
  requirePermission('exams:write'),
  validate(idParamSchema, 'params'),
  examController.calculateGrades
);

router.get(
  '/:id/results',
  requirePermission('exams:read'),
  validate(idParamSchema, 'params'),
  examController.getResults
);

router.get(
  '/:id/report-cards/:studentId',
  requirePermission('exams:read'),
  validate(reportCardParamsSchema, 'params'),
  examController.getReportCard
);

export default router;
