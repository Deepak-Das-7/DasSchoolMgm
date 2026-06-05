import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from '../../../../shared/repositories/base.repository';
import { AcademicSession, IAcademicSession } from '../../../../database/models';
import { PaginationQuery } from '../../../../shared/types/common';

export class AcademicSessionsRepository extends BaseRepository<IAcademicSession> {
  constructor() {
    super(AcademicSession);
  }

  async list(schoolId: string, query: PaginationQuery) {
    return this.findAll(schoolId, query, ['name']);
  }

  async findByName(schoolId: string, name: string): Promise<IAcademicSession | null> {
    return AcademicSession.findOne({
      schoolId: new Types.ObjectId(schoolId),
      name,
      isDeleted: false,
    });
  }

  async clearCurrentFlag(schoolId: string): Promise<void> {
    await AcademicSession.updateMany(
      { schoolId: new Types.ObjectId(schoolId), isDeleted: false, isCurrent: true },
      { isCurrent: false }
    );
  }

  async getCurrent(schoolId: string): Promise<IAcademicSession | null> {
    return AcademicSession.findOne({
      schoolId: new Types.ObjectId(schoolId),
      isCurrent: true,
      isDeleted: false,
    });
  }
}

export const academicSessionsRepository = new AcademicSessionsRepository();
