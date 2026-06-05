import { Types } from 'mongoose';
import { AppError } from '../../../middlewares/error.middleware';
import { attendanceRepository } from '../repositories/attendance.repository';
import { Student } from '../../../database/models/student.model';
import {
  AttendanceEntityType,
  AttendanceStatus,
} from '../../../database/models/attendance.model';

export class AttendanceService {
  async markBulk(
    schoolId: string | null,
    userId: string,
    data: {
      date: Date;
      entries: Array<{
        entityId: string;
        entityType: AttendanceEntityType;
        status: AttendanceStatus;
        remarks?: string;
      }>;
    }
  ) {
    if (!data.entries.length) {
      throw new AppError('At least one attendance entry is required', 400);
    }
    return attendanceRepository.bulkUpsert(
      schoolId,
      userId,
      data.date,
      data.entries
    );
  }

  async list(
    schoolId: string | null,
    query: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      date?: Date;
      fromDate?: Date;
      toDate?: Date;
      entityType?: AttendanceEntityType;
      entityId?: string;
      classId?: string;
      sectionId?: string;
    }
  ) {
    const entityIds = await this.resolveEntityIds(schoolId, query);
    return attendanceRepository.findWithFilters(schoolId, {
      ...query,
      entityIds,
    });
  }

  async monthlyReport(
    schoolId: string | null,
    query: {
      month: number;
      year: number;
      entityType: AttendanceEntityType;
      entityId?: string;
      classId?: string;
      sectionId?: string;
    }
  ) {
    let entityIds: Types.ObjectId[] | undefined;

    if (query.entityId) {
      entityIds = [new Types.ObjectId(query.entityId)];
    } else if (query.entityType === AttendanceEntityType.STUDENT) {
      entityIds = await this.getStudentEntityIds(schoolId, query.classId, query.sectionId);
    }

    const report = await attendanceRepository.aggregateMonthly(
      schoolId,
      query.month,
      query.year,
      query.entityType,
      entityIds
    );

    return report.map((row) => ({
      ...row,
      attendancePercentage:
        row.total > 0
          ? Math.round(
              ((row.present + row.late + row.halfDay * 0.5) / row.total) * 10000
            ) / 100
          : 0,
    }));
  }

  async summaryReport(
    schoolId: string | null,
    query: {
      fromDate: Date;
      toDate: Date;
      entityType: AttendanceEntityType;
      entityId?: string;
      classId?: string;
      sectionId?: string;
    }
  ) {
    let entityIds: Types.ObjectId[] | undefined;

    if (query.entityId) {
      entityIds = [new Types.ObjectId(query.entityId)];
    } else if (query.entityType === AttendanceEntityType.STUDENT) {
      entityIds = await this.getStudentEntityIds(schoolId, query.classId, query.sectionId);
    }

    return attendanceRepository.aggregateSummary(
      schoolId,
      query.fromDate,
      query.toDate,
      query.entityType,
      entityIds
    );
  }

  private async resolveEntityIds(
    schoolId: string | null,
    query: { entityType?: AttendanceEntityType; entityId?: string; classId?: string; sectionId?: string }
  ): Promise<Types.ObjectId[] | undefined> {
    if (query.entityId) return [new Types.ObjectId(query.entityId)];
    if (
      query.entityType === AttendanceEntityType.STUDENT &&
      (query.classId || query.sectionId)
    ) {
      return this.getStudentEntityIds(schoolId, query.classId, query.sectionId);
    }
    return undefined;
  }

  private async getStudentEntityIds(
    schoolId: string | null,
    classId?: string,
    sectionId?: string
  ): Promise<Types.ObjectId[]> {
    const filter: Record<string, unknown> = { isDeleted: false };
    if (schoolId) filter.schoolId = new Types.ObjectId(schoolId);
    if (classId) filter.classId = new Types.ObjectId(classId);
    if (sectionId) filter.sectionId = new Types.ObjectId(sectionId);

    const students = await Student.find(filter).select('_id').lean();
    return students.map((s) => s._id as Types.ObjectId);
  }
}

export const attendanceService = new AttendanceService();
