import { Router } from 'express';
import { z } from 'zod';
import { HostelBuilding, HostelRoom, HostelAllocation } from '../../../database/models';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { CrudService } from '../../../shared/services/crud.service';
import { createCrudController } from '../../../shared/controllers/crud.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { auditLog } from '../../../middlewares/audit.middleware';
import { idParamSchema, objectIdSchema, paginationQuerySchema } from '../../../shared/validators/common.validators';
import { sendSuccess } from '../../../utils/apiResponse';

const buildingService = new CrudService(new BaseRepository(HostelBuilding), ['name']);
const roomService = new CrudService(new BaseRepository(HostelRoom), ['roomNo']);
const allocationService = new CrudService(new BaseRepository(HostelAllocation), []);
const buildingCtrl = createCrudController(buildingService);
const roomCtrl = createCrudController(roomService);
const allocationCtrl = createCrudController(allocationService);

const buildingSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  floors: z.number().int().positive(),
  wardenId: objectIdSchema.optional(),
});

const roomSchema = z.object({
  buildingId: objectIdSchema,
  roomNo: z.string().min(1),
  floor: z.number().int().nonnegative(),
  capacity: z.number().int().positive(),
  type: z.string().min(1),
});

const allocationSchema = z.object({
  studentId: objectIdSchema,
  roomId: objectIdSchema,
  bedNo: z.string().min(1),
  checkInDate: z.coerce.date(),
  checkOutDate: z.coerce.date().optional(),
});

const router = Router();
router.use(authenticate, requireSchoolContext);

router.get('/buildings', requirePermission('hostel:read'), validate(paginationQuerySchema, 'query'), buildingCtrl.list);
router.get('/buildings/:id', requirePermission('hostel:read'), validate(idParamSchema, 'params'), buildingCtrl.getById);
router.post('/buildings', requirePermission('hostel:write'), validate(buildingSchema), auditLog('create', 'hostel_building'), buildingCtrl.create);
router.put('/buildings/:id', requirePermission('hostel:write'), validate(idParamSchema, 'params'), validate(buildingSchema.partial()), auditLog('update', 'hostel_building'), buildingCtrl.update);
router.delete('/buildings/:id', requirePermission('hostel:write'), validate(idParamSchema, 'params'), auditLog('delete', 'hostel_building'), buildingCtrl.remove);

router.get('/rooms/available', requirePermission('hostel:read'), async (req, res) => {
  const repo = new BaseRepository(HostelRoom);
  const result = await repo.findAll(req.user!.schoolId!, { page: 1, limit: 100 } as never, [], { occupied: { $lt: '$capacity' } } as never);
  const available = result.data.filter((r: { occupied: number; capacity: number }) => r.occupied < r.capacity);
  sendSuccess(res, available);
});

router.get('/rooms', requirePermission('hostel:read'), validate(paginationQuerySchema, 'query'), roomCtrl.list);
router.get('/rooms/:id', requirePermission('hostel:read'), validate(idParamSchema, 'params'), roomCtrl.getById);
router.post('/rooms', requirePermission('hostel:write'), validate(roomSchema), auditLog('create', 'hostel_room'), roomCtrl.create);
router.put('/rooms/:id', requirePermission('hostel:write'), validate(idParamSchema, 'params'), validate(roomSchema.partial()), auditLog('update', 'hostel_room'), roomCtrl.update);
router.delete('/rooms/:id', requirePermission('hostel:write'), validate(idParamSchema, 'params'), auditLog('delete', 'hostel_room'), roomCtrl.remove);

router.get('/allocations', requirePermission('hostel:read'), validate(paginationQuerySchema, 'query'), allocationCtrl.list);
router.get('/allocations/:id', requirePermission('hostel:read'), validate(idParamSchema, 'params'), allocationCtrl.getById);
router.post('/allocations', requirePermission('hostel:write'), validate(allocationSchema), auditLog('create', 'hostel_allocation'), allocationCtrl.create);
router.put('/allocations/:id', requirePermission('hostel:write'), validate(idParamSchema, 'params'), validate(allocationSchema.partial()), auditLog('update', 'hostel_allocation'), allocationCtrl.update);
router.delete('/allocations/:id', requirePermission('hostel:write'), validate(idParamSchema, 'params'), auditLog('delete', 'hostel_allocation'), allocationCtrl.remove);

export default router;
