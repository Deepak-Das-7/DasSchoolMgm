import { Types } from 'mongoose';
import { AppError } from '../../../../middlewares/error.middleware';
import { IBranch } from '../../../../database/models';
import { PaginatedResult } from '../../../../shared/types/common';
import { branchesRepository } from '../repositories/branches.repository';
import { BranchResponse } from '../types/branches.types';
import {
  CreateBranchInput,
  ListBranchesQuery,
  UpdateBranchInput,
} from '../validators/branches.validators';

function toResponse(branch: IBranch): BranchResponse {
  return {
    id: branch._id.toString(),
    name: branch.name,
    code: branch.code,
    address: branch.address,
    phone: branch.phone,
    email: branch.email,
    isMain: branch.isMain,
    status: branch.status,
    schoolId: branch.schoolId.toString(),
    createdAt: branch.createdAt,
    updatedAt: branch.updatedAt,
  };
}

export class BranchesService {
  async create(
    schoolId: string,
    input: CreateBranchInput,
    createdBy: string
  ): Promise<BranchResponse> {
    const existing = await branchesRepository.findByCode(schoolId, input.code);
    if (existing) {
      throw new AppError('Branch with this code already exists', 409);
    }

    if (input.isMain) {
      await branchesRepository.clearMainFlag(schoolId);
    } else {
      const mainBranch = await branchesRepository.getMain(schoolId);
      if (!mainBranch) {
        input.isMain = true;
      }
    }

    const branch = await branchesRepository.create({
      name: input.name,
      code: input.code.toUpperCase(),
      address: input.address,
      phone: input.phone,
      email: input.email,
      isMain: input.isMain ?? false,
      status: input.status,
      schoolId: new Types.ObjectId(schoolId),
      createdBy: new Types.ObjectId(createdBy),
      updatedBy: new Types.ObjectId(createdBy),
    });

    return toResponse(branch);
  }

  async list(
    schoolId: string,
    query: ListBranchesQuery
  ): Promise<PaginatedResult<BranchResponse>> {
    const result = await branchesRepository.list(schoolId, query, query.status);
    return {
      data: result.data.map(toResponse),
      pagination: result.pagination,
    };
  }

  async getById(schoolId: string, id: string): Promise<BranchResponse> {
    const branch = await branchesRepository.findById(id, schoolId);
    if (!branch) {
      throw new AppError('Branch not found', 404);
    }
    return toResponse(branch);
  }

  async update(
    schoolId: string,
    id: string,
    input: UpdateBranchInput,
    updatedBy: string
  ): Promise<BranchResponse> {
    const branch = await branchesRepository.findById(id, schoolId);
    if (!branch) {
      throw new AppError('Branch not found', 404);
    }

    if (input.code && input.code.toUpperCase() !== branch.code) {
      const existing = await branchesRepository.findByCode(schoolId, input.code);
      if (existing) {
        throw new AppError('Branch with this code already exists', 409);
      }
    }

    if (input.isMain && !branch.isMain) {
      await branchesRepository.clearMainFlag(schoolId);
    }

    if (input.isMain === false && branch.isMain) {
      const otherBranches = await branchesRepository.count(schoolId, {
        _id: { $ne: branch._id },
      } as never);
      if (otherBranches === 0) {
        throw new AppError('At least one branch must be designated as main', 400);
      }
    }

    const updateData = { ...input };
    if (input.code) updateData.code = input.code.toUpperCase();

    const updated = await branchesRepository.update(id, schoolId, updateData, updatedBy);
    if (!updated) {
      throw new AppError('Branch not found', 404);
    }

    return toResponse(updated);
  }

  async delete(schoolId: string, id: string, deletedBy: string): Promise<void> {
    const branch = await branchesRepository.findById(id, schoolId);
    if (!branch) {
      throw new AppError('Branch not found', 404);
    }

    if (branch.isMain) {
      throw new AppError('Cannot delete the main branch', 400);
    }

    await branchesRepository.softDelete(id, schoolId, deletedBy);
  }
}

export const branchesService = new BranchesService();
