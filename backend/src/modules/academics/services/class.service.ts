import { Types } from 'mongoose';
import { AppError } from '../../../middlewares/error.middleware';
import { classRepository } from '../repositories/class.repository';
import { buildAuditFields } from '../../shared/context';
import { PaginationQuery } from '../../../shared/types/common';

export class ClassService {
  async create(
    schoolId: string | null,
    userId: string,
    data: { name: string; numericOrder: number; sessionId: string }
  ) {
    return classRepository.create({
      ...data,
      sessionId: new Types.ObjectId(data.sessionId),
      ...buildAuditFields(userId, schoolId),
    });
  }

  async list(schoolId: string | null, query: PaginationQuery & { sessionId?: string }) {
    const extra = query.sessionId
      ? { sessionId: new Types.ObjectId(query.sessionId) }
      : {};
    return classRepository.findAll(schoolId, query, ['name'], extra);
  }

  async getById(schoolId: string | null, id: string) {
    const doc = await classRepository.findById(id, schoolId);
    if (!doc) throw new AppError('Class not found', 404);
    return doc;
  }

  async update(
    schoolId: string | null,
    userId: string,
    id: string,
    data: Partial<{ name: string; numericOrder: number; sessionId: string }>
  ) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.sessionId) updateData.sessionId = new Types.ObjectId(data.sessionId);

    const doc = await classRepository.update(id, schoolId, updateData, userId);
    if (!doc) throw new AppError('Class not found', 404);
    return doc;
  }

  async remove(schoolId: string | null, userId: string, id: string) {
    const doc = await classRepository.softDelete(id, schoolId, userId);
    if (!doc) throw new AppError('Class not found', 404);
    return doc;
  }
}

export const classService = new ClassService();
