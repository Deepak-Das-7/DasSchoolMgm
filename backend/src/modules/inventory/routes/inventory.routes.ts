import { Router } from 'express';
import { z } from 'zod';
import { Asset, Stock, Vendor, Purchase } from '../../../database/models';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { CrudService } from '../../../shared/services/crud.service';
import { createCrudController } from '../../../shared/controllers/crud.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { auditLog } from '../../../middlewares/audit.middleware';
import { idParamSchema, objectIdSchema, paginationQuerySchema } from '../../../shared/validators/common.validators';

const assetService = new CrudService(new BaseRepository(Asset), ['name', 'serialNo']);
const stockService = new CrudService(new BaseRepository(Stock), ['name']);
const vendorService = new CrudService(new BaseRepository(Vendor), ['name', 'email']);
const purchaseService = new CrudService(new BaseRepository(Purchase), ['invoiceNo']);

const assetCtrl = createCrudController(assetService);
const stockCtrl = createCrudController(stockService);
const vendorCtrl = createCrudController(vendorService);
const purchaseCtrl = createCrudController(purchaseService);

function crudRoutes(resource: string, permission: string, ctrl: ReturnType<typeof createCrudController>, schema: z.ZodObject<z.ZodRawShape>) {
  const r = Router();
  r.get('/', requirePermission(permission), validate(paginationQuerySchema, 'query'), ctrl.list);
  r.get('/:id', requirePermission(permission), validate(idParamSchema, 'params'), ctrl.getById);
  r.post('/', requirePermission(permission.replace('read', 'write')), validate(schema), auditLog('create', resource), ctrl.create);
  r.put('/:id', requirePermission(permission.replace('read', 'write')), validate(idParamSchema, 'params'), validate(schema.partial()), auditLog('update', resource), ctrl.update);
  r.delete('/:id', requirePermission(permission.replace('read', 'write')), validate(idParamSchema, 'params'), auditLog('delete', resource), ctrl.remove);
  return r;
}

const assetSchema = z.object({ name: z.string(), category: z.string(), serialNo: z.string().optional(), purchaseDate: z.coerce.date().optional(), value: z.number().optional(), location: z.string().optional(), status: z.string().default('active') });
const stockSchema = z.object({ name: z.string(), category: z.string(), quantity: z.number(), unit: z.string(), reorderLevel: z.number().default(10), vendorId: objectIdSchema.optional() });
const vendorSchema = z.object({ name: z.string(), contactPerson: z.string(), email: z.string().email(), phone: z.string(), address: z.string().optional(), gstNo: z.string().optional() });
const purchaseSchema = z.object({ vendorId: objectIdSchema, items: z.array(z.object({ name: z.string(), quantity: z.number(), unitPrice: z.number() })), totalAmount: z.number(), purchaseDate: z.coerce.date(), invoiceNo: z.string(), status: z.string().default('pending') });

const router = Router();
router.use(authenticate, requireSchoolContext);
router.use('/assets', crudRoutes('asset', 'inventory:read', assetCtrl, assetSchema));
router.use('/stock', crudRoutes('stock', 'inventory:read', stockCtrl, stockSchema));
router.use('/vendors', crudRoutes('vendor', 'inventory:read', vendorCtrl, vendorSchema));
router.use('/purchases', crudRoutes('purchase', 'inventory:read', purchaseCtrl, purchaseSchema));

export default router;
