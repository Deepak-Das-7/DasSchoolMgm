import { Types } from 'mongoose';
import { AppError } from '../../../middlewares/error.middleware';
import { lessonPlanRepository } from '../repositories/lessonPlan.repository';
import { buildAuditFields } from '../../shared/context';
import { PaginationQuery } from '../../../shared/types/common';

export class LessonPlanService {
  async create(
    schoolId: string | null,
    userId: string,
    data: {
      subjectId: string;
      classId: string;
      sectionId: string;
      teacherId: string;
      title: string;
      content: string;
      date: Date;
    }
  ) {
    return lessonPlanRepository.create({
      subjectId: new Types.ObjectId(data.subjectId),
      classId: new Types.ObjectId(data.classId),
      sectionId: new Types.ObjectId(data.sectionId),
      teacherId: new Types.ObjectId(data.teacherId),
      title: data.title,
      content: data.content,
      date: data.date,
      ...buildAuditFields(userId, schoolId),
    });
  }

  async list(
    schoolId: string | null,
    query: PaginationQuery & {
      subjectId?: string;
      classId?: string;
      sectionId?: string;
      teacherId?: string;
      fromDate?: Date;
      toDate?: Date;
    }
  ) {
    const extra: Record<string, unknown> = {};
    if (query.subjectId) extra.subjectId = new Types.ObjectId(query.subjectId);
    if (query.classId) extra.classId = new Types.ObjectId(query.classId);
    if (query.sectionId) extra.sectionId = new Types.ObjectId(query.sectionId);
    if (query.teacherId) extra.teacherId = new Types.ObjectId(query.teacherId);
    if (query.fromDate || query.toDate) {
      extra.date = {};
      if (query.fromDate) (extra.date as Record<string, Date>).$gte = query.fromDate;
      if (query.toDate) (extra.date as Record<string, Date>).$lte = query.toDate;
    }
    return lessonPlanRepository.findAll(schoolId, query, ['title'], extra);
  }

  async getById(schoolId: string | null, id: string) {
    const doc = await lessonPlanRepository.findById(id, schoolId);
    if (!doc) throw new AppError('Lesson plan not found', 404);
    return doc;
  }

  async update(
    schoolId: string | null,
    userId: string,
    id: string,
    data: Partial<{
      subjectId: string;
      classId: string;
      sectionId: string;
      teacherId: string;
      title: string;
      content: string;
      date: Date;
    }>
  ) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.subjectId) updateData.subjectId = new Types.ObjectId(data.subjectId);
    if (data.classId) updateData.classId = new Types.ObjectId(data.classId);
    if (data.sectionId) updateData.sectionId = new Types.ObjectId(data.sectionId);
    if (data.teacherId) updateData.teacherId = new Types.ObjectId(data.teacherId);

    const doc = await lessonPlanRepository.update(id, schoolId, updateData, userId);
    if (!doc) throw new AppError('Lesson plan not found', 404);
    return doc;
  }

  async remove(schoolId: string | null, userId: string, id: string) {
    const doc = await lessonPlanRepository.softDelete(id, schoolId, userId);
    if (!doc) throw new AppError('Lesson plan not found', 404);
    return doc;
  }
}

export const lessonPlanService = new LessonPlanService();
