import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { idParamSchema } from '../validators/common.validators';
import {
  createClassSchema,
  updateClassSchema,
  listClassQuerySchema,
} from '../validators/class.validators';
import {
  createSectionSchema,
  updateSectionSchema,
  listSectionQuerySchema,
} from '../validators/section.validators';
import {
  createSubjectSchema,
  updateSubjectSchema,
  listSubjectQuerySchema,
} from '../validators/subject.validators';
import {
  createSyllabusSchema,
  updateSyllabusSchema,
  listSyllabusQuerySchema,
} from '../validators/syllabus.validators';
import {
  createLessonPlanSchema,
  updateLessonPlanSchema,
  listLessonPlanQuerySchema,
} from '../validators/lessonPlan.validators';
import { classController } from '../controllers/class.controller';
import { sectionController } from '../controllers/section.controller';
import { subjectController } from '../controllers/subject.controller';
import { syllabusController } from '../controllers/syllabus.controller';
import { lessonPlanController } from '../controllers/lessonPlan.controller';

const router = Router();

router.use(authenticate, requireSchoolContext);

router
  .route('/classes')
  .get(requirePermission('academics:read'), validate(listClassQuerySchema, 'query'), classController.list)
  .post(requirePermission('academics:write'), validate(createClassSchema), classController.create);

router
  .route('/classes/:id')
  .get(requirePermission('academics:read'), validate(idParamSchema, 'params'), classController.getById)
  .put(
    requirePermission('academics:write'),
    validate(idParamSchema, 'params'),
    validate(updateClassSchema),
    classController.update
  )
  .delete(
    requirePermission('academics:write'),
    validate(idParamSchema, 'params'),
    classController.remove
  );

router
  .route('/sections')
  .get(
    requirePermission('academics:read'),
    validate(listSectionQuerySchema, 'query'),
    sectionController.list
  )
  .post(requirePermission('academics:write'), validate(createSectionSchema), sectionController.create);

router
  .route('/sections/:id')
  .get(requirePermission('academics:read'), validate(idParamSchema, 'params'), sectionController.getById)
  .put(
    requirePermission('academics:write'),
    validate(idParamSchema, 'params'),
    validate(updateSectionSchema),
    sectionController.update
  )
  .delete(
    requirePermission('academics:write'),
    validate(idParamSchema, 'params'),
    sectionController.remove
  );

router
  .route('/subjects')
  .get(
    requirePermission('academics:read'),
    validate(listSubjectQuerySchema, 'query'),
    subjectController.list
  )
  .post(requirePermission('academics:write'), validate(createSubjectSchema), subjectController.create);

router
  .route('/subjects/:id')
  .get(requirePermission('academics:read'), validate(idParamSchema, 'params'), subjectController.getById)
  .put(
    requirePermission('academics:write'),
    validate(idParamSchema, 'params'),
    validate(updateSubjectSchema),
    subjectController.update
  )
  .delete(
    requirePermission('academics:write'),
    validate(idParamSchema, 'params'),
    subjectController.remove
  );

router
  .route('/syllabus')
  .get(
    requirePermission('academics:read'),
    validate(listSyllabusQuerySchema, 'query'),
    syllabusController.list
  )
  .post(requirePermission('academics:write'), validate(createSyllabusSchema), syllabusController.create);

router
  .route('/syllabus/:id')
  .get(requirePermission('academics:read'), validate(idParamSchema, 'params'), syllabusController.getById)
  .put(
    requirePermission('academics:write'),
    validate(idParamSchema, 'params'),
    validate(updateSyllabusSchema),
    syllabusController.update
  )
  .delete(
    requirePermission('academics:write'),
    validate(idParamSchema, 'params'),
    syllabusController.remove
  );

router
  .route('/lesson-plans')
  .get(
    requirePermission('academics:read'),
    validate(listLessonPlanQuerySchema, 'query'),
    lessonPlanController.list
  )
  .post(
    requirePermission('academics:write'),
    validate(createLessonPlanSchema),
    lessonPlanController.create
  );

router
  .route('/lesson-plans/:id')
  .get(
    requirePermission('academics:read'),
    validate(idParamSchema, 'params'),
    lessonPlanController.getById
  )
  .put(
    requirePermission('academics:write'),
    validate(idParamSchema, 'params'),
    validate(updateLessonPlanSchema),
    lessonPlanController.update
  )
  .delete(
    requirePermission('academics:write'),
    validate(idParamSchema, 'params'),
    lessonPlanController.remove
  );

export default router;
