import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
}

export interface IEmployee extends Document, BaseDocumentFields {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: Types.ObjectId;
  designation: string;
  joiningDate: Date;
  salary: number;
  status: EmployeeStatus;
}

const employeeSchema = new Schema<IEmployee>(
  {
    ...baseSchemaFields,
    employeeId: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    designation: { type: String, required: true, trim: true },
    joiningDate: { type: Date, required: true },
    salary: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(EmployeeStatus),
      default: EmployeeStatus.ACTIVE,
    },
  },
  baseSchemaOptions
);

addBaseIndexes(employeeSchema);
employeeSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true });
employeeSchema.index({ schoolId: 1, departmentId: 1 });
employeeSchema.index({ schoolId: 1, status: 1 });

export const Employee = model<IEmployee>('Employee', employeeSchema);
