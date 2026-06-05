import { Types } from 'mongoose';
import { z } from 'zod';
import { AppError } from '../../../middlewares/error.middleware';
import { Department } from '../../../database/models/department.model';
import { EmployeeStatus } from '../../../database/models/employee.model';
import { PaginationQuery } from '../../../shared/types/common';
import { EmployeeRepository } from '../repositories/employees.repository';
import { createEmployeeSchema, updateEmployeeSchema } from '../validators/employees.validators';

type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export class EmployeeService {
  private repository = new EmployeeRepository();

  private requireSchoolId(schoolId: string | null | undefined): string {
    if (!schoolId) {
      throw new AppError('School context required', 403);
    }
    return schoolId;
  }

  private async validateDepartment(schoolId: string, departmentId: string): Promise<void> {
    const department = await Department.findOne({
      _id: departmentId,
      schoolId,
      isDeleted: false,
    });
    if (!department) {
      throw new AppError('Department not found', 404);
    }
  }

  async list(
    schoolId: string | null,
    query: PaginationQuery & { status?: EmployeeStatus; departmentId?: string }
  ) {
    const sid = this.requireSchoolId(schoolId);
    const extraFilter: Record<string, unknown> = {};

    if (query.status) extraFilter.status = query.status;
    if (query.departmentId) {
      extraFilter.departmentId = new Types.ObjectId(query.departmentId);
    }

    return this.repository.findAll(
      sid,
      query,
      ['firstName', 'lastName', 'employeeId', 'email', 'designation'],
      extraFilter
    );
  }

  async getById(schoolId: string | null, id: string) {
    const sid = this.requireSchoolId(schoolId);
    const employee = await this.repository.findById(id, sid);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }
    return employee;
  }

  async create(
    schoolId: string | null,
    userId: string,
    input: CreateEmployeeInput
  ) {
    const sid = this.requireSchoolId(schoolId);
    await this.validateDepartment(sid, input.departmentId);

    const [existingEmployeeId, existingEmail] = await Promise.all([
      this.repository.findByEmployeeId(input.employeeId, sid),
      this.repository.findByEmail(input.email, sid),
    ]);

    if (existingEmployeeId) {
      throw new AppError('Employee ID already exists', 409);
    }
    if (existingEmail) {
      throw new AppError('Email already exists', 409);
    }

    const employee = await this.repository.create({
      schoolId: new Types.ObjectId(sid),
      employeeId: input.employeeId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      departmentId: new Types.ObjectId(input.departmentId),
      designation: input.designation,
      joiningDate: input.joiningDate,
      salary: input.salary,
      status: input.status ?? EmployeeStatus.ACTIVE,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    } as Parameters<EmployeeRepository['create']>[0]);

    return employee;
  }

  async update(
    schoolId: string | null,
    userId: string,
    id: string,
    input: UpdateEmployeeInput
  ) {
    const sid = this.requireSchoolId(schoolId);
    const existing = await this.repository.findById(id, sid);
    if (!existing) {
      throw new AppError('Employee not found', 404);
    }

    if (input.departmentId) {
      await this.validateDepartment(sid, input.departmentId);
    }

    if (input.employeeId && input.employeeId !== existing.employeeId) {
      const duplicate = await this.repository.findByEmployeeId(input.employeeId, sid);
      if (duplicate && duplicate._id.toString() !== id) {
        throw new AppError('Employee ID already exists', 409);
      }
    }

    if (input.email && input.email !== existing.email) {
      const duplicate = await this.repository.findByEmail(input.email, sid);
      if (duplicate && duplicate._id.toString() !== id) {
        throw new AppError('Email already exists', 409);
      }
    }

    const updateData: Record<string, unknown> = { ...input };
    if (input.departmentId) {
      updateData.departmentId = new Types.ObjectId(input.departmentId);
    }

    const employee = await this.repository.update(id, sid, updateData, userId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }
    return employee;
  }

  async remove(schoolId: string | null, userId: string, id: string) {
    const sid = this.requireSchoolId(schoolId);
    const employee = await this.repository.softDelete(id, sid, userId);
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }
    return employee;
  }
}
