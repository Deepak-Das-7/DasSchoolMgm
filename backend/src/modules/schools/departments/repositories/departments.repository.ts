import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from '../../../../shared/repositories/base.repository';
import { Department, IDepartment, DepartmentStatus } from '../../../../database/models';
import { PaginationQuery } from '../../../../shared/types/common';

export class DepartmentsRepository extends BaseRepository<IDepartment> {
  constructor() {
    super(Department);
  }

  async list(schoolId: string, query: PaginationQuery, status?: DepartmentStatus) {
    const extraFilter: FilterQuery<IDepartment> = {};
    if (status) extraFilter.status = status;
    return this.findAll(schoolId, query, ['name', 'code', 'description'], extraFilter);
  }

  async findByCode(schoolId: string, code: string): Promise<IDepartment | null> {
    return Department.findOne({
      schoolId: new Types.ObjectId(schoolId),
      code: code.toUpperCase(),
      isDeleted: false,
    });
  }
}

export const departmentsRepository = new DepartmentsRepository();
