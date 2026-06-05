import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import {
  createFeeStructureSchema,
  updateFeeStructureSchema,
  listFeeStructureQuerySchema,
  idParamSchema,
  recordPaymentSchema,
  listPaymentsQuerySchema,
  createDiscountSchema,
  createScholarshipSchema,
  createFineRuleSchema,
} from '../validators/fee.validators';
import { feeController } from '../controllers/fee.controller';

const router = Router();

router.use(authenticate, requireSchoolContext);

router
  .route('/structures')
  .get(
    requirePermission('fees:read'),
    validate(listFeeStructureQuerySchema, 'query'),
    feeController.listFeeStructures
  )
  .post(
    requirePermission('fees:write'),
    validate(createFeeStructureSchema),
    feeController.createFeeStructure
  );

router
  .route('/structures/:id')
  .get(
    requirePermission('fees:read'),
    validate(idParamSchema, 'params'),
    feeController.getFeeStructure
  )
  .put(
    requirePermission('fees:write'),
    validate(idParamSchema, 'params'),
    validate(updateFeeStructureSchema),
    feeController.updateFeeStructure
  )
  .delete(
    requirePermission('fees:write'),
    validate(idParamSchema, 'params'),
    feeController.removeFeeStructure
  );

router.post(
  '/payments',
  requirePermission('fees:write'),
  validate(recordPaymentSchema),
  feeController.recordPayment
);

router.get(
  '/payments',
  requirePermission('fees:read'),
  validate(listPaymentsQuerySchema, 'query'),
  feeController.listPayments
);

router.get(
  '/payments/:id/receipt',
  requirePermission('fees:read'),
  validate(idParamSchema, 'params'),
  feeController.getReceipt
);

router.post(
  '/discounts',
  requirePermission('fees:write'),
  validate(createDiscountSchema),
  feeController.createDiscount
);

router.post(
  '/scholarships',
  requirePermission('fees:write'),
  validate(createScholarshipSchema),
  feeController.createScholarship
);

router.post(
  '/fines',
  requirePermission('fees:write'),
  validate(createFineRuleSchema),
  feeController.createFineRule
);

export default router;
