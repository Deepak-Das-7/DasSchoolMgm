import { Types } from 'mongoose';
import { AppError } from '../../../../middlewares/error.middleware';
import { IDepartment } from '../../../../database/models';
import { PaginatedResult } from '../../../../shared/types/common';
import { departmentsRepository } from '../repositories/departments.repository';
import { DepartmentResponse } from '../types/departments.types';
import {
  CreateDepartmentInput,
  ListDepartmentsQuery,
  UpdateDepartmentInput,
} from '../validators/departments.validators';

function toResponse(department: IDepartment): DepartmentResponse {
  return {
    id: department._id.toString(),
    name: department.name,
    code: department.code,
    description: department.description,
    headId: department.headId?.toString(),
    status: department.status,
    schoolId: department.schoolId.toString(),
    createdAt: department.createdAt,
    updatedAt: department.updatedAt,
  };
}

export class DepartmentsService {
  async create(
    schoolId: string,
    input: CreateDepartmentInput,
    createdBy: string
  ): Promise<DepartmentResponse> {
    const existing = await departmentsRepository.findByCode(schoolId, input.code);
    if (existing) {
      throw new AppError('Department with this code already exists', 409);
    }

    const department = await departmentsRepository.create({
      name: input.name,
      code: input.code.toUpperCase(),
      description: input.description,
      headId: input.headId ? new Types.ObjectId(input.headId) : undefined,
      status: input.status,
      schoolId: new Types.ObjectId(schoolId),
      createdBy: new Types.ObjectId(createdBy),
      updatedBy: new Types.ObjectId(createdBy),
    });

    return toResponse(department);
  }

  async list(
    schoolId: string,
    query: ListDepartmentsQuery
  ): Promise<PaginatedResult<DepartmentResponse>> {
    const result = await departmentsRepository.list(schoolId, query, query.status);
    return {
      data: result.data.map(toResponse),
      pagination: result.pagination,
    };
  }

  async getById(schoolId: string, id: string): Promise<DepartmentResponse> {
    const department = await departmentsRepository.findById(id, schoolId);
    if (!department) {
      throw new AppError('Department not found', 404);
    }
    return toResponse(department);
  }

  async update(
    schoolId: string,
    id: string,
    input: UpdateDepartmentInput,
    updatedBy: string
  ): Promise<DepartmentResponse> {
    const department = await departmentsRepository.findById(id, schoolId);
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    if (input.code && input.code.toUpperCase() !== department.code) {
      const existing = await departmentsRepository.findByCode(schoolId, input.code);
      if (existing) {
        throw new AppError('Department with this code already exists', 409);
      }
    }

    const updateData: Record<string, unknown> = { ...input };
    if (input.code) updateData.code = input.code.toUpperCase();
    if (input.headId) updateData.headId = new Types.ObjectId(input.headId);

    const updated = await departmentsRepository.update(
      id,
      schoolId,
      updateData,
      updatedBy
    );
    if (!updated) {
      throw new AppError('Department not found', 404);
    }

    return toResponse(updated);
  }

  async delete(schoolId: string, id: string, deletedBy: string): Promise<void> {
    const department = await departmentsRepository.findById(id, schoolId);
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    await departmentsRepository.softDelete(id, schoolId, deletedBy);
  }
}

export const departmentsService = new DepartmentsService();
