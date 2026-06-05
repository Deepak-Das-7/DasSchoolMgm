import { Types } from 'mongoose';
import { AppError } from '../../../middlewares/error.middleware';
import { syllabusRepository } from '../repositories/syllabus.repository';
import { subjectRepository } from '../repositories/subject.repository';
import { classRepository } from '../repositories/class.repository';
import { buildAuditFields } from '../../shared/context';
import { PaginationQuery } from '../../../shared/types/common';
import { ISyllabusTopic } from '../../../database/models/syllabus.model';

export class SyllabusService {
  async create(
    schoolId: string | null,
    userId: string,
    data: { subjectId: string; classId: string; topics?: ISyllabusTopic[] }
  ) {
    const [subject, classDoc] = await Promise.all([
      subjectRepository.findById(data.subjectId, schoolId),
      classRepository.findById(data.classId, schoolId),
    ]);
    if (!subject) throw new AppError('Subject not found', 404);
    if (!classDoc) throw new AppError('Class not found', 404);

    return syllabusRepository.create({
      subjectId: new Types.ObjectId(data.subjectId),
      classId: new Types.ObjectId(data.classId),
      topics: data.topics ?? [],
      ...buildAuditFields(userId, schoolId),
    });
  }

  async list(
    schoolId: string | null,
    query: PaginationQuery & { subjectId?: string; classId?: string }
  ) {
    const extra: Record<string, unknown> = {};
    if (query.subjectId) extra.subjectId = new Types.ObjectId(query.subjectId);
    if (query.classId) extra.classId = new Types.ObjectId(query.classId);
    return syllabusRepository.findAll(schoolId, query, [], extra);
  }

  async getById(schoolId: string | null, id: string) {
    const doc = await syllabusRepository.findById(id, schoolId);
    if (!doc) throw new AppError('Syllabus not found', 404);
    return doc;
  }

  async update(
    schoolId: string | null,
    userId: string,
    id: string,
    data: { topics: ISyllabusTopic[] }
  ) {
    const doc = await syllabusRepository.update(id, schoolId, { topics: data.topics }, userId);
    if (!doc) throw new AppError('Syllabus not found', 404);
    return doc;
  }

  async remove(schoolId: string | null, userId: string, id: string) {
    const doc = await syllabusRepository.softDelete(id, schoolId, userId);
    if (!doc) throw new AppError('Syllabus not found', 404);
    return doc;
  }
}

export const syllabusService = new SyllabusService();
