import { Types } from 'mongoose';
import { AppError } from '../../../middlewares/error.middleware';
import { subjectRepository } from '../repositories/subject.repository';
import { buildAuditFields } from '../../shared/context';
import { PaginationQuery } from '../../../shared/types/common';
import { SubjectType } from '../../../database/models/subject.model';

export class SubjectService {
  async create(
    schoolId: string | null,
    userId: string,
    data: { name: string; code: string; type?: SubjectType; classIds?: string[] }
  ) {
    return subjectRepository.create({
      name: data.name,
      code: data.code.toUpperCase(),
      type: data.type ?? SubjectType.CORE,
      classIds: (data.classIds ?? []).map((id) => new Types.ObjectId(id)),
      ...buildAuditFields(userId, schoolId),
    });
  }

  async list(
    schoolId: string | null,
    query: PaginationQuery & { classId?: string; type?: SubjectType }
  ) {
    const extra: Record<string, unknown> = {};
    if (query.classId) extra.classIds = new Types.ObjectId(query.classId);
    if (query.type) extra.type = query.type;
    return subjectRepository.findAll(schoolId, query, ['name', 'code'], extra);
  }

  async getById(schoolId: string | null, id: string) {
    const doc = await subjectRepository.findById(id, schoolId);
    if (!doc) throw new AppError('Subject not found', 404);
    return doc;
  }

  async update(
    schoolId: string | null,
    userId: string,
    id: string,
    data: Partial<{ name: string; code: string; type: SubjectType; classIds: string[] }>
  ) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.code) updateData.code = data.code.toUpperCase();
    if (data.classIds) {
      updateData.classIds = data.classIds.map((cid) => new Types.ObjectId(cid));
    }

    const doc = await subjectRepository.update(id, schoolId, updateData, userId);
    if (!doc) throw new AppError('Subject not found', 404);
    return doc;
  }

  async remove(schoolId: string | null, userId: string, id: string) {
    const doc = await subjectRepository.softDelete(id, schoolId, userId);
    if (!doc) throw new AppError('Subject not found', 404);
    return doc;
  }
}

export const subjectService = new SubjectService();
