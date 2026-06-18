import { Types } from 'mongoose';
import { AppError } from '../../../middlewares/error.middleware';
import { sectionRepository } from '../repositories/section.repository';
import { classRepository } from '../repositories/class.repository';
import { buildAuditFields } from '../../shared/context';
import { PaginationQuery } from '../../../shared/types/common';

export class SectionService {
  async create(
    schoolId: string | null,
    userId: string,
    data: { name: string; classId: string; capacity: number; classTeacherId?: string }
  ) {
    const classDoc = await classRepository.findById(data.classId, schoolId);
    if (!classDoc) throw new AppError('Class not found', 404);

    return sectionRepository.create({
      name: data.name,
      classId: new Types.ObjectId(data.classId),
      capacity: data.capacity,
      classTeacherId: data.classTeacherId
        ? new Types.ObjectId(data.classTeacherId)
        : undefined,
      ...buildAuditFields(userId, schoolId),
    });
  }

  async list(schoolId: string | null, query: PaginationQuery & { classId?: string }) {
    const extra = query.classId ? { classId: new Types.ObjectId(query.classId) } : {};
    return sectionRepository.findAll(schoolId, query, ['name'], extra);
  }

  async getById(schoolId: string | null, id: string) {
    const doc = await sectionRepository.findById(id, schoolId);
    if (!doc) throw new AppError('Section not found', 404);
    return doc;
  }

  // async getByClassId(schoolId: string | null, classId: string) {
  //   const doc = await sectionRepository.findByClass(schoolId, classId);
  //   if (!doc) throw new AppError('Section not found', 404);
  //   return doc;
  // }

  async update(
    schoolId: string | null,
    userId: string,
    id: string,
    data: Partial<{ name: string; classId: string; capacity: number; classTeacherId?: string }>
  ) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.classId) {
      const classDoc = await classRepository.findById(data.classId, schoolId);
      if (!classDoc) throw new AppError('Class not found', 404);
      updateData.classId = new Types.ObjectId(data.classId);
    }
    if (data.classTeacherId) {
      updateData.classTeacherId = new Types.ObjectId(data.classTeacherId);
    }

    const doc = await sectionRepository.update(id, schoolId, updateData, userId);
    if (!doc) throw new AppError('Section not found', 404);
    return doc;
  }

  async remove(schoolId: string | null, userId: string, id: string) {
    const doc = await sectionRepository.softDelete(id, schoolId, userId);
    if (!doc) throw new AppError('Section not found', 404);
    return doc;
  }
}

export const sectionService = new SectionService();
