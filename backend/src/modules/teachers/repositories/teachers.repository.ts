import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { ITeacher, Teacher } from '../../../database/models/teacher.model';
import {
  Attendance,
  AttendanceEntityType,
  IAttendance,
} from '../../../database/models/attendance.model';
import { ILeave, Leave, LeaveEntityType } from '../../../database/models/leave.model';
import { PaginationQuery } from '../../../shared/types/common';
import { parsePagination, buildPaginatedResult } from '../../../utils/pagination';

export class TeacherRepository extends BaseRepository<ITeacher> {
  constructor() {
    super(Teacher);
  }

  async findByEmployeeId(employeeId: string, schoolId: string): Promise<ITeacher | null> {
    return this.model.findOne(
      this.baseFilter(schoolId, { employeeId } as Record<string, unknown>)
    );
  }

  async findByEmail(email: string, schoolId: string): Promise<ITeacher | null> {
    return this.model.findOne(
      this.baseFilter(schoolId, { email: email.toLowerCase() } as Record<string, unknown>)
    );
  }

  async findAttendance(
    teacherId: string,
    schoolId: string,
    query: PaginationQuery & { fromDate?: Date; toDate?: Date }
  ) {
    const { page, limit, skip, sort } = parsePagination(query);
    const filter: FilterQuery<IAttendance> = {
      schoolId: new Types.ObjectId(schoolId),
      isDeleted: false,
      entityId: new Types.ObjectId(teacherId),
      entityType: AttendanceEntityType.TEACHER,
    };

    if (query.fromDate || query.toDate) {
      filter.date = {};
      if (query.fromDate) filter.date.$gte = query.fromDate;
      if (query.toDate) filter.date.$lte = query.toDate;
    }

    const [data, total] = await Promise.all([
      Attendance.find(filter).sort(sort).skip(skip).limit(limit),
      Attendance.countDocuments(filter),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }

  async findLeave(
    teacherId: string,
    schoolId: string,
    query: PaginationQuery & {
      status?: string;
      fromDate?: Date;
      toDate?: Date;
    }
  ) {
    const { page, limit, skip, sort } = parsePagination(query);
    const filter: FilterQuery<ILeave> = {
      schoolId: new Types.ObjectId(schoolId),
      isDeleted: false,
      entityId: new Types.ObjectId(teacherId),
      entityType: LeaveEntityType.TEACHER,
    };

    if (query.status) filter.status = query.status;
    if (query.fromDate || query.toDate) {
      filter.startDate = {};
      if (query.fromDate) filter.startDate.$gte = query.fromDate;
      if (query.toDate) filter.startDate.$lte = query.toDate;
    }

    const [data, total] = await Promise.all([
      Leave.find(filter).sort(sort).skip(skip).limit(limit),
      Leave.countDocuments(filter),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }
}
