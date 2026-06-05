import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import {
  Attendance,
  IAttendance,
  AttendanceEntityType,
  AttendanceStatus,
} from '../../../database/models/attendance.model';
import { parsePagination, buildPaginatedResult } from '../../../utils/pagination';
import { PaginationQuery } from '../../../shared/types/common';

export interface AttendanceListQuery extends PaginationQuery {
  date?: Date;
  fromDate?: Date;
  toDate?: Date;
  entityType?: AttendanceEntityType;
  entityId?: string;
  entityIds?: Types.ObjectId[];
}

export interface MonthlyAggregation {
  entityId: Types.ObjectId;
  entityType: AttendanceEntityType;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  total: number;
}

class AttendanceRepository extends BaseRepository<IAttendance> {
  constructor() {
    super(Attendance);
  }

  async bulkUpsert(
    schoolId: string | null,
    userId: string,
    date: Date,
    entries: Array<{
      entityId: string;
      entityType: AttendanceEntityType;
      status: AttendanceStatus;
      remarks?: string;
    }>
  ): Promise<IAttendance[]> {
    const schoolObjectId = schoolId ? new Types.ObjectId(schoolId) : null;
    const markedBy = new Types.ObjectId(userId);
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const results: IAttendance[] = [];

    for (const entry of entries) {
      const filter = {
        schoolId: schoolObjectId,
        isDeleted: false,
        date: normalizedDate,
        entityId: new Types.ObjectId(entry.entityId),
        entityType: entry.entityType,
      };

      const doc = await this.model.findOneAndUpdate(
        filter,
        {
          $set: {
            status: entry.status,
            remarks: entry.remarks,
            markedBy,
            updatedBy: markedBy,
          },
          $setOnInsert: {
            schoolId: schoolObjectId,
            createdBy: markedBy,
            isDeleted: false,
            date: normalizedDate,
            entityId: new Types.ObjectId(entry.entityId),
            entityType: entry.entityType,
          },
        },
        { upsert: true, new: true, runValidators: true }
      );
      results.push(doc);
    }

    return results;
  }

  async findWithFilters(
    schoolId: string | null,
    query: AttendanceListQuery
  ) {
    const { page, limit, skip, sort } = parsePagination(query);
    const filter = this.buildFilter(schoolId, query);

    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit),
      this.model.countDocuments(filter),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }

  private buildFilter(
    schoolId: string | null,
    query: AttendanceListQuery
  ): FilterQuery<IAttendance> {
    const extra: FilterQuery<IAttendance> = {};

    if (query.date) {
      const d = new Date(query.date);
      d.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      extra.date = { $gte: d, $lte: end };
    } else if (query.fromDate || query.toDate) {
      extra.date = {};
      if (query.fromDate) (extra.date as Record<string, Date>).$gte = query.fromDate;
      if (query.toDate) (extra.date as Record<string, Date>).$lte = query.toDate;
    }

    if (query.entityType) extra.entityType = query.entityType;
    if (query.entityId) extra.entityId = new Types.ObjectId(query.entityId);
    if (query.entityIds?.length) extra.entityId = { $in: query.entityIds };

    return this.baseFilter(schoolId, extra);
  }

  async aggregateMonthly(
    schoolId: string | null,
    month: number,
    year: number,
    entityType: AttendanceEntityType,
    entityIds?: Types.ObjectId[]
  ): Promise<MonthlyAggregation[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const match: Record<string, unknown> = {
      isDeleted: false,
      entityType,
      date: { $gte: startDate, $lte: endDate },
    };
    if (schoolId) match.schoolId = new Types.ObjectId(schoolId);
    if (entityIds?.length) match.entityId = { $in: entityIds };

    return this.model.aggregate<MonthlyAggregation>([
      { $match: match },
      {
        $group: {
          _id: { entityId: '$entityId', entityType: '$entityType' },
          present: {
            $sum: { $cond: [{ $eq: ['$status', AttendanceStatus.PRESENT] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', AttendanceStatus.ABSENT] }, 1, 0] },
          },
          late: {
            $sum: { $cond: [{ $eq: ['$status', AttendanceStatus.LATE] }, 1, 0] },
          },
          halfDay: {
            $sum: { $cond: [{ $eq: ['$status', AttendanceStatus.HALF_DAY] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          entityId: '$_id.entityId',
          entityType: '$_id.entityType',
          present: 1,
          absent: 1,
          late: 1,
          halfDay: 1,
          total: 1,
        },
      },
    ]);
  }

  async aggregateSummary(
    schoolId: string | null,
    fromDate: Date,
    toDate: Date,
    entityType: AttendanceEntityType,
    entityIds?: Types.ObjectId[]
  ) {
    const match: Record<string, unknown> = {
      isDeleted: false,
      entityType,
      date: { $gte: fromDate, $lte: toDate },
    };
    if (schoolId) match.schoolId = new Types.ObjectId(schoolId);
    if (entityIds?.length) match.entityId = { $in: entityIds };

    const [stats] = await this.model.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    [
                      AttendanceStatus.PRESENT,
                      AttendanceStatus.LATE,
                      AttendanceStatus.HALF_DAY,
                    ],
                  ],
                },
                1,
                0,
              ],
            },
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', AttendanceStatus.ABSENT] }, 1, 0] },
          },
        },
      },
    ]);

    const total = stats?.total ?? 0;
    const present = stats?.present ?? 0;
    const absent = stats?.absent ?? 0;
    const percentage = total > 0 ? Math.round((present / total) * 10000) / 100 : 0;

    return { total, present, absent, percentage };
  }
}

export const attendanceRepository = new AttendanceRepository();
