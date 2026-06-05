import { Router } from 'express';
import { z } from 'zod';
import { Vehicle, Route } from '../../../database/models';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { CrudService } from '../../../shared/services/crud.service';
import { createCrudController } from '../../../shared/controllers/crud.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { auditLog } from '../../../middlewares/audit.middleware';
import { idParamSchema, paginationQuerySchema } from '../../../shared/validators/common.validators';
import { sendSuccess } from '../../../utils/apiResponse';
import { AppError } from '../../../middlewares/error.middleware';

const vehicleService = new CrudService(new BaseRepository(Vehicle), ['registrationNo', 'driverName']);
const routeService = new CrudService(new BaseRepository(Route), ['name']);
const vehicleCtrl = createCrudController(vehicleService);
const routeCtrl = createCrudController(routeService);

const vehicleSchema = z.object({
  registrationNo: z.string().min(1),
  type: z.string().min(1),
  capacity: z.number().int().positive(),
  driverName: z.string().min(1),
  driverPhone: z.string().min(1),
  gpsDeviceId: z.string().optional(),
});

const routeSchema = z.object({
  name: z.string().min(1),
  vehicleId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  stops: z.array(z.object({
    name: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    arrivalTime: z.string().optional(),
  })),
  startTime: z.string(),
  endTime: z.string(),
  fare: z.number().nonnegative().default(0),
});

const router = Router();
router.use(authenticate, requireSchoolContext);

router.get('/vehicles', requirePermission('transport:read'), validate(paginationQuerySchema, 'query'), vehicleCtrl.list);
router.get('/vehicles/:id', requirePermission('transport:read'), validate(idParamSchema, 'params'), vehicleCtrl.getById);
router.post('/vehicles', requirePermission('transport:write'), validate(vehicleSchema), auditLog('create', 'vehicle'), vehicleCtrl.create);
router.put('/vehicles/:id', requirePermission('transport:write'), validate(idParamSchema, 'params'), validate(vehicleSchema.partial()), auditLog('update', 'vehicle'), vehicleCtrl.update);
router.delete('/vehicles/:id', requirePermission('transport:write'), validate(idParamSchema, 'params'), auditLog('delete', 'vehicle'), vehicleCtrl.remove);

router.get('/routes', requirePermission('transport:read'), validate(paginationQuerySchema, 'query'), routeCtrl.list);
router.get('/routes/:id', requirePermission('transport:read'), validate(idParamSchema, 'params'), routeCtrl.getById);
router.get('/routes/:id/stops', requirePermission('transport:read'), validate(idParamSchema, 'params'), async (req, res) => {
  const route = await routeService.getById(req.params.id, req.user!.schoolId!);
  sendSuccess(res, (route as { stops?: unknown[] }).stops || []);
});
router.post('/routes', requirePermission('transport:write'), validate(routeSchema), auditLog('create', 'route'), routeCtrl.create);
router.put('/routes/:id', requirePermission('transport:write'), validate(idParamSchema, 'params'), validate(routeSchema.partial()), auditLog('update', 'route'), routeCtrl.update);
router.delete('/routes/:id', requirePermission('transport:write'), validate(idParamSchema, 'params'), auditLog('delete', 'route'), routeCtrl.remove);

export default router;
