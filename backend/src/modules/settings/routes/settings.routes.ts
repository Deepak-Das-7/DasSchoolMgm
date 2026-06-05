import { Router } from 'express';
import { z } from 'zod';
import { School, User } from '../../../database/models';
import { ROLE_PERMISSIONS, UserRole } from '../../../shared/constants/roles';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { auditLog } from '../../../middlewares/audit.middleware';
import { sendSuccess } from '../../../utils/apiResponse';
import { AppError } from '../../../middlewares/error.middleware';
import { Types } from 'mongoose';
import { idParamSchema } from '../../../shared/validators/common.validators';

const router = Router();
router.use(authenticate, requireSchoolContext);

router.get('/general', requirePermission('settings:read'), async (req, res) => {
  const school = await School.findById(req.user!.schoolId);
  if (!school) throw new AppError('School not found', 404);
  sendSuccess(res, school.settings);
});

router.put('/general', requirePermission('settings:write'), validate(z.object({
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  currency: z.string().optional(),
  academicYearStart: z.string().optional(),
  language: z.string().optional(),
})), auditLog('update', 'school_settings'), async (req, res) => {
  const school = await School.findByIdAndUpdate(
    req.user!.schoolId,
    { settings: req.body, updatedBy: new Types.ObjectId(req.user!.id) },
    { new: true }
  );
  sendSuccess(res, school?.settings);
});

router.get('/branding', requirePermission('settings:read'), async (req, res) => {
  const school = await School.findById(req.user!.schoolId);
  sendSuccess(res, school?.branding);
});

router.put('/branding', requirePermission('settings:write'), validate(z.object({
  logo: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  favicon: z.string().optional(),
  tagline: z.string().optional(),
})), auditLog('update', 'school_branding'), async (req, res) => {
  const school = await School.findByIdAndUpdate(
    req.user!.schoolId,
    { branding: req.body, updatedBy: new Types.ObjectId(req.user!.id) },
    { new: true }
  );
  sendSuccess(res, school?.branding);
});

router.get('/roles', requirePermission('settings:read'), (_req, res) => {
  const roles = Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
    role,
    permissions,
    label: role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  }));
  sendSuccess(res, roles);
});

router.put('/roles/:role/permissions', requirePermission('settings:write'), validate(z.object({
  permissions: z.array(z.string()),
})), auditLog('update', 'role_permissions'), (req, res) => {
  const role = req.params.role as UserRole;
  if (!ROLE_PERMISSIONS[role]) throw new AppError('Invalid role', 400);
  ROLE_PERMISSIONS[role] = req.body.permissions;
  sendSuccess(res, { role, permissions: ROLE_PERMISSIONS[role] });
});

router.get('/users/:id/permissions', requirePermission('settings:read'), validate(idParamSchema, 'params'), async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, schoolId: req.user!.schoolId, isDeleted: false });
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, { permissions: user.permissions, role: user.role });
});

router.put('/users/:id/permissions', requirePermission('settings:write'), validate(idParamSchema, 'params'), validate(z.object({
  permissions: z.array(z.string()),
})), auditLog('update', 'user_permissions'), async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, schoolId: req.user!.schoolId, isDeleted: false },
    { permissions: req.body.permissions, updatedBy: new Types.ObjectId(req.user!.id) },
    { new: true }
  );
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, { permissions: user.permissions });
});

export default router;
