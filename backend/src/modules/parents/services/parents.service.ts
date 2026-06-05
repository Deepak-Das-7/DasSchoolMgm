import { Types } from 'mongoose';
import { z } from 'zod';
import { AppError } from '../../../middlewares/error.middleware';
import { Student } from '../../../database/models/student.model';
import { PaginationQuery } from '../../../shared/types/common';
import { StudentRepository } from '../../students/repositories/students.repository';
import { ParentRepository } from '../repositories/parents.repository';
import {
  createParentSchema,
  linkStudentSchema,
  updateParentSchema,
} from '../validators/parents.validators';

type CreateParentInput = z.infer<typeof createParentSchema>;
type UpdateParentInput = z.infer<typeof updateParentSchema>;
type LinkStudentInput = z.infer<typeof linkStudentSchema>;

export class ParentService {
  private repository = new ParentRepository();
  private studentRepository = new StudentRepository();

  private requireSchoolId(schoolId: string | null | undefined): string {
    if (!schoolId) {
      throw new AppError('School context required', 403);
    }
    return schoolId;
  }

  private buildPortalData(parent: Awaited<ReturnType<ParentRepository['findById']>>, children: Awaited<ReturnType<ParentRepository['findChildren']>>) {
    const activeChildren = children.filter((child) => child.status === 'active').length;
    return {
      totalChildren: children.length,
      activeChildren,
      children: children.map((child) => ({
        id: child._id,
        admissionNo: child.admissionNo,
        firstName: child.firstName,
        lastName: child.lastName,
        status: child.status,
        class: child.classId,
        section: child.sectionId,
        rollNo: child.rollNo,
      })),
      contact: {
        email: parent?.email,
        phone: parent?.phone,
      },
    };
  }

  async list(schoolId: string | null, query: PaginationQuery) {
    const sid = this.requireSchoolId(schoolId);
    return this.repository.findAll(sid, query, ['firstName', 'lastName', 'email', 'phone']);
  }

  async getById(schoolId: string | null, id: string) {
    const sid = this.requireSchoolId(schoolId);
    const parent = await this.repository.findById(id, sid);
    if (!parent) {
      throw new AppError('Parent not found', 404);
    }

    const children = await this.repository.findChildren(id, sid);
    return {
      ...parent.toJSON(),
      portal: this.buildPortalData(parent, children),
    };
  }

  async create(
    schoolId: string | null,
    userId: string,
    input: CreateParentInput
  ) {
    const sid = this.requireSchoolId(schoolId);

    const [existingEmail, existingPhone] = await Promise.all([
      this.repository.findByEmail(input.email, sid),
      this.repository.findByPhone(input.phone, sid),
    ]);

    if (existingEmail) {
      throw new AppError('A parent with this email already exists', 409);
    }
    if (existingPhone) {
      throw new AppError('A parent with this phone number already exists', 409);
    }

    if (input.studentIds?.length) {
      for (const studentId of input.studentIds) {
        const student = await this.studentRepository.findById(studentId, sid);
        if (!student) {
          throw new AppError(`Student ${studentId} not found`, 404);
        }
      }
    }

    const parent = await this.repository.create({
      schoolId: new Types.ObjectId(sid),
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      occupation: input.occupation,
      studentIds: (input.studentIds ?? []).map((id) => new Types.ObjectId(id)),
      userId: input.userId ? new Types.ObjectId(input.userId) : undefined,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    } as Parameters<ParentRepository['create']>[0]);

    if (input.studentIds?.length) {
      await Promise.all(
        input.studentIds.map((studentId) =>
          this.studentRepository.linkParent(studentId, sid, parent._id.toString(), userId)
        )
      );
    }

    return parent;
  }

  async update(
    schoolId: string | null,
    userId: string,
    id: string,
    input: UpdateParentInput
  ) {
    const sid = this.requireSchoolId(schoolId);
    const existing = await this.repository.findById(id, sid);
    if (!existing) {
      throw new AppError('Parent not found', 404);
    }

    if (input.email && input.email !== existing.email) {
      const duplicate = await this.repository.findByEmail(input.email, sid);
      if (duplicate && duplicate._id.toString() !== id) {
        throw new AppError('A parent with this email already exists', 409);
      }
    }

    if (input.phone && input.phone !== existing.phone) {
      const duplicate = await this.repository.findByPhone(input.phone, sid);
      if (duplicate && duplicate._id.toString() !== id) {
        throw new AppError('A parent with this phone number already exists', 409);
      }
    }

    const updateData: Record<string, unknown> = { ...input };
    if (input.studentIds) {
      updateData.studentIds = input.studentIds.map((sid2) => new Types.ObjectId(sid2));
    }
    if (input.userId) {
      updateData.userId = new Types.ObjectId(input.userId);
    }

    const parent = await this.repository.update(id, sid, updateData, userId);
    if (!parent) {
      throw new AppError('Parent not found', 404);
    }
    return parent;
  }

  async remove(schoolId: string | null, userId: string, id: string) {
    const sid = this.requireSchoolId(schoolId);
    const existing = await this.repository.findById(id, sid);
    if (!existing) {
      throw new AppError('Parent not found', 404);
    }

    await Promise.all(
      existing.studentIds.map((studentId) =>
        this.studentRepository.unlinkParent(studentId.toString(), sid, id, userId)
      )
    );

    const parent = await this.repository.softDelete(id, sid, userId);
    if (!parent) {
      throw new AppError('Parent not found', 404);
    }
    return parent;
  }

  async getChildren(schoolId: string | null, id: string) {
    const sid = this.requireSchoolId(schoolId);
    const parent = await this.repository.findById(id, sid);
    if (!parent) {
      throw new AppError('Parent not found', 404);
    }

    const children = await this.repository.findChildren(id, sid);
    return {
      parentId: parent._id,
      children,
    };
  }

  async linkStudent(
    schoolId: string | null,
    userId: string,
    parentId: string,
    input: LinkStudentInput
  ) {
    const sid = this.requireSchoolId(schoolId);

    const [parent, student] = await Promise.all([
      this.repository.findById(parentId, sid),
      Student.findOne({
        _id: input.studentId,
        schoolId: sid,
        isDeleted: false,
      }),
    ]);

    if (!parent) {
      throw new AppError('Parent not found', 404);
    }
    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const updatedParent = await this.repository.linkStudent(
      parentId,
      sid,
      input.studentId,
      userId
    );
    await this.studentRepository.linkParent(input.studentId, sid, parentId, userId);

    return {
      parent: updatedParent,
      student,
    };
  }
}
