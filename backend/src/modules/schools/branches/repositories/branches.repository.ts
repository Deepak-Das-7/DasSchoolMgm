import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from '../../../../shared/repositories/base.repository';
import { Branch, IBranch, BranchStatus } from '../../../../database/models';
import { PaginationQuery } from '../../../../shared/types/common';

export class BranchesRepository extends BaseRepository<IBranch> {
  constructor() {
    super(Branch);
  }

  async list(schoolId: string, query: PaginationQuery, status?: BranchStatus) {
    const extraFilter: FilterQuery<IBranch> = {};
    if (status) extraFilter.status = status;
    return this.findAll(schoolId, query, ['name', 'code'], extraFilter);
  }

  async findByCode(schoolId: string, code: string): Promise<IBranch | null> {
    return Branch.findOne({
      schoolId: new Types.ObjectId(schoolId),
      code: code.toUpperCase(),
      isDeleted: false,
    });
  }

  async clearMainFlag(schoolId: string): Promise<void> {
    await Branch.updateMany(
      { schoolId: new Types.ObjectId(schoolId), isDeleted: false, isMain: true },
      { isMain: false }
    );
  }

  async getMain(schoolId: string): Promise<IBranch | null> {
    return Branch.findOne({
      schoolId: new Types.ObjectId(schoolId),
      isMain: true,
      isDeleted: false,
    });
  }
}

export const branchesRepository = new BranchesRepository();
