import { Router } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { Event, Holiday } from '../../../database/models';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { CrudService } from '../../../shared/services/crud.service';
import { createCrudController } from '../../../shared/controllers/crud.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { auditLog } from '../../../middlewares/audit.middleware';
import { idParamSchema, paginationQuerySchema } from '../../../shared/validators/common.validators';
import { sendSuccess } from '../../../utils/apiResponse';

const eventService = new CrudService(new BaseRepository(Event), ['title']);
const holidayService = new CrudService(new BaseRepository(Holiday), ['name']);
const eventCtrl = createCrudController(eventService);
const holidayCtrl = createCrudController(holidayService);

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.string().default('general'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  location: z.string().optional(),
  targetRoles: z.array(z.string()).default([]),
});

const holidaySchema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
  type: z.string().default('public'),
  description: z.string().optional(),
});

const router = Router();
router.use(authenticate, requireSchoolContext);

router.get('/events', requirePermission('events:read'), validate(paginationQuerySchema, 'query'), eventCtrl.list);
router.get('/events/:id', requirePermission('events:read'), validate(idParamSchema, 'params'), eventCtrl.getById);
router.post('/events', requirePermission('events:write'), validate(eventSchema), auditLog('create', 'event'), eventCtrl.create);
router.put('/events/:id', requirePermission('events:write'), validate(idParamSchema, 'params'), validate(eventSchema.partial()), auditLog('update', 'event'), eventCtrl.update);
router.delete('/events/:id', requirePermission('events:write'), validate(idParamSchema, 'params'), auditLog('delete', 'event'), eventCtrl.remove);

router.get('/holidays', requirePermission('events:read'), validate(paginationQuerySchema, 'query'), holidayCtrl.list);
router.get('/holidays/:id', requirePermission('events:read'), validate(idParamSchema, 'params'), holidayCtrl.getById);
router.post('/holidays', requirePermission('events:write'), validate(holidaySchema), auditLog('create', 'holiday'), holidayCtrl.create);
router.put('/holidays/:id', requirePermission('events:write'), validate(idParamSchema, 'params'), validate(holidaySchema.partial()), auditLog('update', 'holiday'), holidayCtrl.update);
router.delete('/holidays/:id', requirePermission('events:write'), validate(idParamSchema, 'params'), auditLog('delete', 'holiday'), holidayCtrl.remove);

router.get('/calendar', requirePermission('events:read'), async (req, res) => {
  const schoolId = new Types.ObjectId(req.user!.schoolId!);
  const [events, holidays] = await Promise.all([
    Event.find({ schoolId, isDeleted: false }).sort({ startDate: 1 }).limit(100),
    Holiday.find({ schoolId, isDeleted: false }).sort({ date: 1 }).limit(100),
  ]);
  sendSuccess(res, { events, holidays });
});

export default router;
