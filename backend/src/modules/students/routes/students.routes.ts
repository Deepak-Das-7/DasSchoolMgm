import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { auditLog } from '../../../middlewares/audit.middleware';
import { upload } from '../../../middlewares/upload.middleware';
import { studentController } from '../controllers/students.controller';
import {
  createStudentSchema,
  idParamSchema,
  listStudentsQuerySchema,
  promoteStudentSchema,
  transferCertificateSchema,
  updateStudentSchema,
  uploadDocumentSchema,
} from '../validators/students.validators';
import { paginationQuerySchema } from '../../../shared/validators/common.validators';

const router = Router();

router.use(authenticate, requireSchoolContext);

router.get(
  '/',
  requirePermission('students:read'),
  validate(listStudentsQuerySchema, 'query'),
  studentController.list.bind(studentController)
);

router.get(
  '/alumni',
  requirePermission('students:read'),
  validate(paginationQuerySchema, 'query'),
  studentController.listAlumni.bind(studentController)
);

router.get(
  '/:id',
  requirePermission('students:read'),
  validate(idParamSchema, 'params'),
  studentController.getById.bind(studentController)
);

router.post(
  '/',
  requirePermission('students:write'),
  validate(createStudentSchema),
  auditLog('create', 'student'),
  studentController.create.bind(studentController)
);

router.put(
  '/:id',
  requirePermission('students:write'),
  validate(idParamSchema, 'params'),
  validate(updateStudentSchema),
  auditLog('update', 'student'),
  studentController.update.bind(studentController)
);

router.delete(
  '/:id',
  requirePermission('students:write'),
  validate(idParamSchema, 'params'),
  auditLog('delete', 'student'),
  studentController.remove.bind(studentController)
);

router.post(
  '/:id/promote',
  requirePermission('students:write'),
  validate(idParamSchema, 'params'),
  validate(promoteStudentSchema),
  auditLog('update', 'student'),
  studentController.promote.bind(studentController)
);

router.post(
  '/:id/transfer-certificate',
  requirePermission('students:write'),
  validate(idParamSchema, 'params'),
  validate(transferCertificateSchema),
  auditLog('update', 'student'),
  studentController.issueTransferCertificate.bind(studentController)
);

router.post(
  '/:id/documents',
  requirePermission('students:write'),
  validate(idParamSchema, 'params'),
  upload.single('file'),
  validate(uploadDocumentSchema),
  auditLog('create', 'student_document'),
  studentController.uploadDocument.bind(studentController)
);

export default router;
