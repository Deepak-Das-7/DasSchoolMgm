import { Types } from 'mongoose';
import { z } from 'zod';
import { AppError } from '../../../middlewares/error.middleware';
import { Class } from '../../../database/models/class.model';
import { Subject } from '../../../database/models/subject.model';
import { TeacherStatus } from '../../../database/models/teacher.model';
import { PaginationQuery } from '../../../shared/types/common';
import { TeacherRepository } from '../repositories/teachers.repository';
import {
  createTeacherSchema,
  teacherAttendanceQuerySchema,
  teacherLeaveQuerySchema,
  updateTeacherSchema,
} from '../validators/teachers.validators';

type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
type AttendanceQuery = z.infer<typeof teacherAttendanceQuerySchema>;
type LeaveQuery = z.infer<typeof teacherLeaveQuerySchema>;

export class TeacherService {
  private repository = new TeacherRepository();

  private requireSchoolId(schoolId: string | null | undefined): string {
    if (!schoolId) {
      throw new AppError('School context required', 403);
    }
    return schoolId;
  }

  private async validateReferences(
    schoolId: string,
    subjectIds?: string[],
    classIds?: string[]
  ): Promise<void> {
    if (subjectIds?.length) {
      const count = await Subject.countDocuments({
        _id: { $in: subjectIds.map((id) => new Types.ObjectId(id)) },
        schoolId,
        isDeleted: false,
      });
      if (count !== subjectIds.length) {
        throw new AppError('One or more subjects not found', 404);
      }
    }

    if (classIds?.length) {
      const count = await Class.countDocuments({
        _id: { $in: classIds.map((id) => new Types.ObjectId(id)) },
        schoolId,
        isDeleted: false,
      });
      if (count !== classIds.length) {
        throw new AppError('One or more classes not found', 404);
      }
    }
  }

  async list(
    schoolId: string | null,
    query: PaginationQuery & { status?: TeacherStatus }
  ) {
    const sid = this.requireSchoolId(schoolId);
    const extraFilter: Record<string, unknown> = {};
    if (query.status) extraFilter.status = query.status;

    return this.repository.findAll(
      sid,
      query,
      ['firstName', 'lastName', 'employeeId', 'email', 'phone'],
      extraFilter
    );
  }

  async getById(schoolId: string | null, id: string) {
    const sid = this.requireSchoolId(schoolId);
    const teacher = await this.repository.findById(id, sid);
    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }
    return teacher;
  }

  async create(
    schoolId: string | null,
    userId: string,
    input: CreateTeacherInput
  ) {
    const sid = this.requireSchoolId(schoolId);
    await this.validateReferences(sid, input.subjects, input.classIds);

    const [existingEmployeeId, existingEmail] = await Promise.all([
      this.repository.findByEmployeeId(input.employeeId, sid),
      this.repository.findByEmail(input.email, sid),
    ]);

    if (existingEmployeeId) {
      throw new AppError('Employee ID already exists', 409);
    }
    if (existingEmail) {
      throw new AppError('Email already exists', 409);
    }

    const teacher = await this.repository.create({
      schoolId: new Types.ObjectId(sid),
      employeeId: input.employeeId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      qualifications: input.qualifications ?? [],
      subjects: (input.subjects ?? []).map((id) => new Types.ObjectId(id)),
      classIds: (input.classIds ?? []).map((id) => new Types.ObjectId(id)),
      salary: input.salary,
      joiningDate: input.joiningDate,
      status: input.status ?? TeacherStatus.ACTIVE,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    } as Parameters<TeacherRepository['create']>[0]);

    return teacher;
  }

  async update(
    schoolId: string | null,
    userId: string,
    id: string,
    input: UpdateTeacherInput
  ) {
    const sid = this.requireSchoolId(schoolId);
    const existing = await this.repository.findById(id, sid);
    if (!existing) {
      throw new AppError('Teacher not found', 404);
    }

    await this.validateReferences(sid, input.subjects, input.classIds);

    if (input.employeeId && input.employeeId !== existing.employeeId) {
      const duplicate = await this.repository.findByEmployeeId(input.employeeId, sid);
      if (duplicate && duplicate._id.toString() !== id) {
        throw new AppError('Employee ID already exists', 409);
      }
    }

    if (input.email && input.email !== existing.email) {
      const duplicate = await this.repository.findByEmail(input.email, sid);
      if (duplicate && duplicate._id.toString() !== id) {
        throw new AppError('Email already exists', 409);
      }
    }

    const updateData: Record<string, unknown> = { ...input };
    if (input.subjects) {
      updateData.subjects = input.subjects.map((sid2) => new Types.ObjectId(sid2));
    }
    if (input.classIds) {
      updateData.classIds = input.classIds.map((cid) => new Types.ObjectId(cid));
    }

    const teacher = await this.repository.update(id, sid, updateData, userId);
    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }
    return teacher;
  }

  async remove(schoolId: string | null, userId: string, id: string) {
    const sid = this.requireSchoolId(schoolId);
    const teacher = await this.repository.softDelete(id, sid, userId);
    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }
    return teacher;
  }

  async getAttendance(
    schoolId: string | null,
    id: string,
    query: AttendanceQuery
  ) {
    const sid = this.requireSchoolId(schoolId);
    const teacher = await this.repository.findById(id, sid);
    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }

    return this.repository.findAttendance(id, sid, query);
  }

  async getLeave(schoolId: string | null, id: string, query: LeaveQuery) {
    const sid = this.requireSchoolId(schoolId);
    const teacher = await this.repository.findById(id, sid);
    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }

    return this.repository.findLeave(id, sid, query);
  }
}
