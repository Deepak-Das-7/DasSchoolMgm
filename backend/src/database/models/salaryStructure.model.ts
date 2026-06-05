import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaFields, baseSchemaOptions, addBaseIndexes, BaseDocumentFields } from '../base.schema';

export interface ISalaryComponent {
  name: string;
  amount: number;
  type: 'allowance' | 'deduction' | 'tax';
}

export interface ISalaryStructure extends Document, BaseDocumentFields {
  employeeId: Types.ObjectId;
  employeeType: 'teacher' | 'employee';
  basicSalary: number;
  components: ISalaryComponent[];
  effectiveFrom: Date;
}

const salaryStructureSchema = new Schema<ISalaryStructure>({
  ...baseSchemaFields,
  employeeId: { type: Schema.Types.ObjectId, required: true },
  employeeType: { type: String, enum: ['teacher', 'employee'], required: true },
  basicSalary: { type: Number, required: true },
  components: [{
    name: String,
    amount: Number,
    type: { type: String, enum: ['allowance', 'deduction', 'tax'] },
  }],
  effectiveFrom: { type: Date, required: true },
}, baseSchemaOptions);

addBaseIndexes(salaryStructureSchema);
salaryStructureSchema.index({ schoolId: 1, employeeId: 1 });

export const SalaryStructure = model<ISalaryStructure>('SalaryStructure', salaryStructureSchema);
