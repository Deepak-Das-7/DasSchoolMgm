import { Router } from 'express';
import { z } from 'zod';
import { Announcement, Notification, EmailTemplate, SmsTemplate } from '../../../database/models';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { CrudService } from '../../../shared/services/crud.service';
import { createCrudController } from '../../../shared/controllers/crud.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { auditLog } from '../../../middlewares/audit.middleware';
import { idParamSchema, paginationQuerySchema } from '../../../shared/validators/common.validators';
import { sendSuccess } from '../../../utils/apiResponse';
import { Types } from 'mongoose';

const announcementService = new CrudService(new BaseRepository(Announcement), ['title']);
const emailTemplateService = new CrudService(new BaseRepository(EmailTemplate), ['name']);
const smsTemplateService = new CrudService(new BaseRepository(SmsTemplate), ['name']);
const announcementCtrl = createCrudController(announcementService);
const emailCtrl = createCrudController(emailTemplateService);
const smsCtrl = createCrudController(smsTemplateService);

const announcementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  targetRoles: z.array(z.string()).default([]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  publishDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
});

const templateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().optional(),
  body: z.string().min(1),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

const router = Router();
router.use(authenticate, requireSchoolContext);

router.get('/announcements', requirePermission('communication:read'), validate(paginationQuerySchema, 'query'), announcementCtrl.list);
router.get('/announcements/:id', requirePermission('communication:read'), validate(idParamSchema, 'params'), announcementCtrl.getById);
router.post('/announcements', requirePermission('communication:write'), validate(announcementSchema), auditLog('create', 'announcement'), announcementCtrl.create);
router.put('/announcements/:id', requirePermission('communication:write'), validate(idParamSchema, 'params'), validate(announcementSchema.partial()), auditLog('update', 'announcement'), announcementCtrl.update);
router.delete('/announcements/:id', requirePermission('communication:write'), validate(idParamSchema, 'params'), auditLog('delete', 'announcement'), announcementCtrl.remove);

router.get('/notifications', requirePermission('communication:read'), validate(paginationQuerySchema, 'query'), async (req, res) => {
  const repo = new BaseRepository(Notification);
  const result = await repo.findAll(req.user!.schoolId!, req.query as never, ['title', 'message'], { userId: new Types.ObjectId(req.user!.id) } as never);
  sendSuccess(res, result);
});

router.post('/notifications', requirePermission('communication:write'), validate(z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  title: z.string(),
  message: z.string(),
  type: z.string().default('info'),
  link: z.string().optional(),
})), auditLog('create', 'notification'), async (req, res) => {
  const repo = new BaseRepository(Notification);
  const notification = await repo.create({
    ...req.body,
    schoolId: new Types.ObjectId(req.user!.schoolId!),
    isRead: false,
    createdBy: new Types.ObjectId(req.user!.id),
    updatedBy: new Types.ObjectId(req.user!.id),
  } as never);
  sendSuccess(res, notification, 'Notification created', 201);
});

router.get('/email-templates', requirePermission('communication:read'), validate(paginationQuerySchema, 'query'), emailCtrl.list);
router.post('/email-templates', requirePermission('communication:write'), validate(templateSchema), auditLog('create', 'email_template'), emailCtrl.create);
router.put('/email-templates/:id', requirePermission('communication:write'), validate(idParamSchema, 'params'), validate(templateSchema.partial()), auditLog('update', 'email_template'), emailCtrl.update);
router.delete('/email-templates/:id', requirePermission('communication:write'), validate(idParamSchema, 'params'), auditLog('delete', 'email_template'), emailCtrl.remove);

router.get('/sms-templates', requirePermission('communication:read'), validate(paginationQuerySchema, 'query'), smsCtrl.list);
router.post('/sms-templates', requirePermission('communication:write'), validate(templateSchema.omit({ subject: true })), auditLog('create', 'sms_template'), smsCtrl.create);
router.put('/sms-templates/:id', requirePermission('communication:write'), validate(idParamSchema, 'params'), validate(templateSchema.omit({ subject: true }).partial()), auditLog('update', 'sms_template'), smsCtrl.update);
router.delete('/sms-templates/:id', requirePermission('communication:write'), validate(idParamSchema, 'params'), auditLog('delete', 'sms_template'), smsCtrl.remove);

export default router;
