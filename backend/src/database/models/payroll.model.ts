import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum PayrollEmployeeType {
  TEACHER = 'teacher',
  EMPLOYEE = 'employee',
}

export enum PayrollStatus {
  DRAFT = 'draft',
  PROCESSED = 'processed',
  PAID = 'paid',
}

export interface IPayrollAllowance {
  name: string;
  amount: number;
}

export interface IPayrollDeduction {
  name: string;
  amount: number;
}

export interface IPayroll extends Document, BaseDocumentFields {
  employeeId: Types.ObjectId;
  employeeType: PayrollEmployeeType;
  month: number;
  year: number;
  basicSalary: number;
  allowances: IPayrollAllowance[];
  deductions: IPayrollDeduction[];
  netSalary: number;
  status: PayrollStatus;
}

const allowanceSchema = new Schema<IPayrollAllowance>(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const deductionSchema = new Schema<IPayrollDeduction>(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const payrollSchema = new Schema<IPayroll>(
  {
    ...baseSchemaFields,
    employeeId: { type: Schema.Types.ObjectId, required: true },
    employeeType: {
      type: String,
      enum: Object.values(PayrollEmployeeType),
      required: true,
    },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000 },
    basicSalary: { type: Number, required: true, min: 0 },
    allowances: { type: [allowanceSchema], default: [] },
    deductions: { type: [deductionSchema], default: [] },
    netSalary: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(PayrollStatus),
      default: PayrollStatus.DRAFT,
    },
  },
  baseSchemaOptions
);

addBaseIndexes(payrollSchema);
payrollSchema.index(
  { schoolId: 1, employeeId: 1, employeeType: 1, month: 1, year: 1 },
  { unique: true }
);
payrollSchema.index({ schoolId: 1, month: 1, year: 1, status: 1 });

export const Payroll = model<IPayroll>('Payroll', payrollSchema);
