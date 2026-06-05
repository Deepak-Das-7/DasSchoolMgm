import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requireRole } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { UserRole } from '../../../shared/constants/roles';
import { schoolsController } from '../controllers/schools.controller';
import {
  createSchoolSchema,
  listSchoolsQuerySchema,
  schoolIdParamSchema,
  updateBrandingSchema,
  updateSchoolSchema,
  updateSettingsSchema,
  updateSubscriptionSchema,
} from '../validators/schools.validators';
import academicSessionsRoutes from '../academic-sessions/routes/academic-sessions.routes';
import branchesRoutes from '../branches/routes/branches.routes';
import departmentsRoutes from '../departments/routes/departments.routes';

const router = Router();

router.use(authenticate);

router.get(
  '/profile',
  requireRole(UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN),
  schoolsController.getProfile.bind(schoolsController)
);
router.put(
  '/profile',
  requireRole(UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN),
  validate(updateSchoolSchema),
  schoolsController.updateProfile.bind(schoolsController)
);

router.post(
  '/',
  requireRole(UserRole.SUPER_ADMIN),
  validate(createSchoolSchema),
  schoolsController.create.bind(schoolsController)
);
router.get(
  '/',
  requireRole(UserRole.SUPER_ADMIN),
  validate(listSchoolsQuerySchema, 'query'),
  schoolsController.list.bind(schoolsController)
);

router.use('/academic-sessions', academicSessionsRoutes);
router.use('/branches', branchesRoutes);
router.use('/departments', departmentsRoutes);

router.get(
  '/:id',
  validate(schoolIdParamSchema, 'params'),
  schoolsController.getById.bind(schoolsController)
);
router.put(
  '/:id',
  validate(schoolIdParamSchema, 'params'),
  validate(updateSchoolSchema),
  schoolsController.update.bind(schoolsController)
);
router.delete(
  '/:id',
  requireRole(UserRole.SUPER_ADMIN),
  validate(schoolIdParamSchema, 'params'),
  schoolsController.remove.bind(schoolsController)
);
router.put(
  '/:id/subscription',
  requireRole(UserRole.SUPER_ADMIN),
  validate(schoolIdParamSchema, 'params'),
  validate(updateSubscriptionSchema),
  schoolsController.updateSubscription.bind(schoolsController)
);
router.put(
  '/:id/branding',
  validate(schoolIdParamSchema, 'params'),
  validate(updateBrandingSchema),
  schoolsController.updateBranding.bind(schoolsController)
);
router.put(
  '/:id/settings',
  validate(schoolIdParamSchema, 'params'),
  validate(updateSettingsSchema),
  schoolsController.updateSettings.bind(schoolsController)
);

export default router;
