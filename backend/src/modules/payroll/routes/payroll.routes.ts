import { Router } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { Payroll, SalaryStructure, PayrollStatus, IPayroll } from '../../../database/models';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { CrudService } from '../../../shared/services/crud.service';
import { createCrudController } from '../../../shared/controllers/crud.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { requirePermission, requireSchoolContext } from '../../../middlewares/rbac.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { auditLog } from '../../../middlewares/audit.middleware';
import { idParamSchema, objectIdSchema, paginationQuerySchema } from '../../../shared/validators/common.validators';
import { sendSuccess, sendCreated } from '../../../utils/apiResponse';
import { AppError } from '../../../middlewares/error.middleware';

const structureService = new CrudService(new BaseRepository(SalaryStructure), []);
const payrollService = new CrudService(new BaseRepository(Payroll), []);
const structureCtrl = createCrudController(structureService);

const structureSchema = z.object({
  employeeId: objectIdSchema,
  employeeType: z.enum(['teacher', 'employee']),
  basicSalary: z.number().positive(),
  components: z.array(z.object({ name: z.string(), amount: z.number(), type: z.enum(['allowance', 'deduction', 'tax']) })).default([]),
  effectiveFrom: z.coerce.date(),
});

const router = Router();
router.use(authenticate, requireSchoolContext);

router.get('/structures', requirePermission('payroll:read'), validate(paginationQuerySchema, 'query'), structureCtrl.list);
router.get('/structures/:id', requirePermission('payroll:read'), validate(idParamSchema, 'params'), structureCtrl.getById);
router.post('/structures', requirePermission('payroll:write'), validate(structureSchema), auditLog('create', 'salary_structure'), structureCtrl.create);
router.put('/structures/:id', requirePermission('payroll:write'), validate(idParamSchema, 'params'), validate(structureSchema.partial()), auditLog('update', 'salary_structure'), structureCtrl.update);
router.delete('/structures/:id', requirePermission('payroll:write'), validate(idParamSchema, 'params'), auditLog('delete', 'salary_structure'), structureCtrl.remove);

router.post('/generate', requirePermission('payroll:write'), validate(z.object({ month: z.number().int().min(1).max(12), year: z.number().int() })), auditLog('create', 'payroll'), async (req, res) => {
  const { month, year } = req.body;
  const schoolId = req.user!.schoolId!;
  const structures = await SalaryStructure.find({ schoolId: new Types.ObjectId(schoolId), isDeleted: false });
  const generated = [];

  for (const structure of structures) {
    const allowances = structure.components.filter((c) => c.type === 'allowance');
    const deductions = structure.components.filter((c) => c.type === 'deduction' || c.type === 'tax');
    const allowanceTotal = allowances.reduce((s, c) => s + c.amount, 0);
    const deductionTotal = deductions.reduce((s, c) => s + c.amount, 0);
    const netSalary = structure.basicSalary + allowanceTotal - deductionTotal;

    const existing = await Payroll.findOne({ schoolId, employeeId: structure.employeeId, month, year, isDeleted: false });
    if (existing) continue;

    const payroll = await Payroll.create({
      schoolId: new Types.ObjectId(schoolId),
      employeeId: structure.employeeId,
      employeeType: structure.employeeType,
      month, year,
      basicSalary: structure.basicSalary,
      allowances, deductions,
      netSalary,
      status: PayrollStatus.PROCESSED,
      createdBy: new Types.ObjectId(req.user!.id),
      updatedBy: new Types.ObjectId(req.user!.id),
    });
    generated.push(payroll);
  }
  sendCreated(res, generated, `Generated ${generated.length} payroll records`);
});

router.get('/', requirePermission('payroll:read'), validate(paginationQuerySchema, 'query'), async (req, res) => {
  const result = await payrollService.list(req.user!.schoolId!, req.query as never);
  sendSuccess(res, result);
});

router.get('/:id', requirePermission('payroll:read'), validate(idParamSchema, 'params'), async (req, res) => {
  const payroll = await payrollService.getById(req.params.id, req.user!.schoolId!);
  sendSuccess(res, payroll);
});

router.get('/:id/payslip', requirePermission('payroll:read'), validate(idParamSchema, 'params'), async (req, res) => {
  const payroll = await payrollService.getById(req.params.id, req.user!.schoolId!) as IPayroll;
  sendSuccess(res, {
    employeeId: payroll.employeeId,
    month: payroll.month,
    year: payroll.year,
    basicSalary: payroll.basicSalary,
    allowances: payroll.allowances,
    deductions: payroll.deductions,
    netSalary: payroll.netSalary,
    status: payroll.status,
    generatedAt: payroll.createdAt,
  });
});

export default router;
