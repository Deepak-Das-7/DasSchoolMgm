import { Types } from 'mongoose';
import { AppError } from '../../../../middlewares/error.middleware';
import { IAcademicSession } from '../../../../database/models';
import { PaginatedResult } from '../../../../shared/types/common';
import { academicSessionsRepository } from '../repositories/academic-sessions.repository';
import { AcademicSessionResponse } from '../types/academic-sessions.types';
import {
  CreateAcademicSessionInput,
  ListAcademicSessionsQuery,
  UpdateAcademicSessionInput,
} from '../validators/academic-sessions.validators';

const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
const formatter = new Intl.DateTimeFormat('en-GB', dateOptions);

function toResponse(session: IAcademicSession): AcademicSessionResponse {
  return {
    id: session._id.toString(),
    name: session.name,
    startDate: formatter.format(new Date(session.startDate)) as any,
    endDate: formatter.format(new Date(session.endDate)) as any,
    isCurrent: session.isCurrent,
    schoolId: session.schoolId!.toString(),
    status: session.status,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export class AcademicSessionsService {
  async create(
    schoolId: string,
    input: CreateAcademicSessionInput,
    createdBy: string
  ): Promise<AcademicSessionResponse> {
    const existing = await academicSessionsRepository.findByName(schoolId, input.name);
    if (existing) {
      throw new AppError('Academic session with this name already exists', 409);
    }

    if (input.isCurrent) {
      await academicSessionsRepository.clearCurrentFlag(schoolId);
    }

    const session = await academicSessionsRepository.create({
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate,
      isCurrent: input.isCurrent ?? false,
      schoolId: new Types.ObjectId(schoolId),
      createdBy: new Types.ObjectId(createdBy),
      updatedBy: new Types.ObjectId(createdBy),
    });

    return toResponse(session);
  }

  async list(
    schoolId: string,
    query: ListAcademicSessionsQuery
  ): Promise<PaginatedResult<AcademicSessionResponse>> {
    const result = await academicSessionsRepository.list(schoolId, query);
    return {
      data: result.data.map(toResponse),
      pagination: result.pagination,
    };
  }

  async getById(schoolId: string, id: string): Promise<AcademicSessionResponse> {
    const session = await academicSessionsRepository.findById(id, schoolId);
    if (!session) {
      throw new AppError('Academic session not found', 404);
    }
    return toResponse(session);
  }

  async update(
    schoolId: string,
    id: string,
    input: UpdateAcademicSessionInput,
    updatedBy: string
  ): Promise<AcademicSessionResponse> {
    const session = await academicSessionsRepository.findById(id, schoolId);
    if (!session) {
      throw new AppError('Academic session not found', 404);
    }

    if (input.name && input.name !== session.name) {
      const existing = await academicSessionsRepository.findByName(schoolId, input.name);
      if (existing) {
        throw new AppError('Academic session with this name already exists', 409);
      }
    }

    const startDate = input.startDate ?? session.startDate;
    const endDate = input.endDate ?? session.endDate;
    if (endDate <= startDate) {
      throw new AppError('End date must be after start date', 400);
    }

    if (input.isCurrent) {
      await academicSessionsRepository.clearCurrentFlag(schoolId);
    }

    const updated = await academicSessionsRepository.update(id, schoolId, input, updatedBy);
    if (!updated) {
      throw new AppError('Academic session not found', 404);
    }

    return toResponse(updated);
  }

  async delete(schoolId: string, id: string, deletedBy: string): Promise<void> {
    const session = await academicSessionsRepository.findById(id, schoolId);
    if (!session) {
      throw new AppError('Academic session not found', 404);
    }

    if (session.isCurrent) {
      throw new AppError('Cannot delete the current academic session', 400);
    }

    await academicSessionsRepository.softDelete(id, schoolId, deletedBy);
  }
}

export const academicSessionsService = new AcademicSessionsService();