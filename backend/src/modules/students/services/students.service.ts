import path from 'path';
import { Types } from 'mongoose';
import { AppError } from '../../../middlewares/error.middleware';
import { Class } from '../../../database/models/class.model';
import { Section } from '../../../database/models/section.model';
import { StudentStatus } from '../../../database/models/student.model';
import { PaginationQuery } from '../../../shared/types/common';
import { StudentRepository } from '../repositories/students.repository';
import {
  createStudentSchema,
  promoteStudentSchema,
  transferCertificateSchema,
  updateStudentSchema,
} from '../validators/students.validators';
import { z } from 'zod';

type CreateStudentInput = z.infer<typeof createStudentSchema>;
type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
type PromoteStudentInput = z.infer<typeof promoteStudentSchema>;
type TransferCertificateInput = z.infer<typeof transferCertificateSchema>;

export class StudentService {
  private repository = new StudentRepository();

  private requireSchoolId(schoolId: string | null | undefined): string {
    if (!schoolId) {
      throw new AppError('School context required', 403);
    }
    return schoolId;
  }

  private async validateClassSection(
    schoolId: string,
    classId: string,
    sectionId: string
  ): Promise<void> {
    const [classDoc, sectionDoc] = await Promise.all([
      Class.findOne({ _id: classId, schoolId, isDeleted: false }),
      Section.findOne({ _id: sectionId, schoolId, isDeleted: false }),
    ]);

    if (!classDoc) {
      throw new AppError('Class not found', 404);
    }
    if (!sectionDoc) {
      throw new AppError('Section not found', 404);
    }
    if (sectionDoc.classId.toString() !== classId) {
      throw new AppError('Section does not belong to the specified class', 400);
    }
  }

  private async generateAdmissionNo(schoolId: string): Promise<string> {
    const year = new Date().getFullYear();
    let sequence = await this.repository.getNextAdmissionSequence(schoolId);
    let admissionNo = `ADM-${year}-${String(sequence).padStart(4, '0')}`;

    while (await this.repository.findByAdmissionNo(admissionNo, schoolId)) {
      sequence += 1;
      admissionNo = `ADM-${year}-${String(sequence).padStart(4, '0')}`;
    }

    return admissionNo;
  }

  async list(schoolId: string | null, query: PaginationQuery & {
    status?: StudentStatus;
    classId?: string;
    sectionId?: string;
  }) {
    const sid = this.requireSchoolId(schoolId);
    const extraFilter: Record<string, unknown> = {};

    if (query.status) extraFilter.status = query.status;
    if (query.classId) extraFilter.classId = new Types.ObjectId(query.classId);
    if (query.sectionId) extraFilter.sectionId = new Types.ObjectId(query.sectionId);

    return this.repository.findAll(
      sid,
      query,
      ['firstName', 'lastName', 'admissionNo', 'rollNo'],
      extraFilter
    );
  }

  async getById(schoolId: string | null, id: string) {
    const sid = this.requireSchoolId(schoolId);
    const student = await this.repository.findById(id, sid);
    if (!student) {
      throw new AppError('Student not found', 404);
    }
    return student;
  }

  async create(
    schoolId: string | null,
    userId: string,
    input: CreateStudentInput
  ) {
    const sid = this.requireSchoolId(schoolId);
    await this.validateClassSection(sid, input.classId, input.sectionId);

    const admissionNo = input.admissionNo ?? (await this.generateAdmissionNo(sid));
    const existing = await this.repository.findByAdmissionNo(admissionNo, sid);
    if (existing) {
      throw new AppError('Admission number already exists', 409);
    }

    const student = await this.repository.create({
      schoolId: new Types.ObjectId(sid),
      admissionNo,
      rollNo: input.rollNo,
      firstName: input.firstName,
      lastName: input.lastName,
      gender: input.gender,
      dob: input.dob,
      classId: new Types.ObjectId(input.classId),
      sectionId: new Types.ObjectId(input.sectionId),
      parentIds: (input.parentIds ?? []).map((id) => new Types.ObjectId(id)),
      status: StudentStatus.ACTIVE,
      admissionDate: input.admissionDate ?? new Date(),
      bloodGroup: input.bloodGroup,
      address: input.address ?? {},
      photo: input.photo,
      documents: [],
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    } as Parameters<StudentRepository['create']>[0]);

    return student;
  }

  async update(
    schoolId: string | null,
    userId: string,
    id: string,
    input: UpdateStudentInput
  ) {
    const sid = this.requireSchoolId(schoolId);
    const existing = await this.repository.findById(id, sid);
    if (!existing) {
      throw new AppError('Student not found', 404);
    }

    if (input.classId && input.sectionId) {
      await this.validateClassSection(sid, input.classId, input.sectionId);
    } else if (input.classId || input.sectionId) {
      const classId = input.classId ?? existing.classId.toString();
      const sectionId = input.sectionId ?? existing.sectionId.toString();
      await this.validateClassSection(sid, classId, sectionId);
    }

    if (input.admissionNo && input.admissionNo !== existing.admissionNo) {
      const duplicate = await this.repository.findByAdmissionNo(input.admissionNo, sid);
      if (duplicate && duplicate._id.toString() !== id) {
        throw new AppError('Admission number already exists', 409);
      }
    }

    const updateData: Record<string, unknown> = { ...input };
    if (input.classId) updateData.classId = new Types.ObjectId(input.classId);
    if (input.sectionId) updateData.sectionId = new Types.ObjectId(input.sectionId);
    if (input.parentIds) {
      updateData.parentIds = input.parentIds.map((pid) => new Types.ObjectId(pid));
    }

    const student = await this.repository.update(id, sid, updateData, userId);
    if (!student) {
      throw new AppError('Student not found', 404);
    }
    return student;
  }

  async remove(schoolId: string | null, userId: string, id: string) {
    const sid = this.requireSchoolId(schoolId);
    const student = await this.repository.softDelete(id, sid, userId);
    if (!student) {
      throw new AppError('Student not found', 404);
    }
    return student;
  }

  async promote(
    schoolId: string | null,
    userId: string,
    id: string,
    input: PromoteStudentInput
  ) {
    const sid = this.requireSchoolId(schoolId);
    const existing = await this.repository.findById(id, sid);
    if (!existing) {
      throw new AppError('Student not found', 404);
    }
    if (existing.status !== StudentStatus.ACTIVE) {
      throw new AppError('Only active students can be promoted', 400);
    }

    await this.validateClassSection(sid, input.classId, input.sectionId);

    const student = await this.repository.promote(
      id,
      sid,
      input.classId,
      input.sectionId,
      input.rollNo,
      userId
    );
    if (!student) {
      throw new AppError('Promotion failed', 400);
    }
    return student;
  }

  async issueTransferCertificate(
    schoolId: string | null,
    userId: string,
    id: string,
    input: TransferCertificateInput
  ) {
    const sid = this.requireSchoolId(schoolId);
    const existing = await this.repository.findById(id, sid);
    if (!existing) {
      throw new AppError('Student not found', 404);
    }
    if (existing.status !== StudentStatus.ACTIVE) {
      throw new AppError('Transfer certificate can only be issued for active students', 400);
    }

    const issuedAt = new Date();
    const tcDocument = {
      name: `Transfer Certificate - ${existing.admissionNo}`,
      type: 'transfer_certificate',
      url: `/documents/tc/${existing.admissionNo}-${issuedAt.getTime()}.pdf`,
      uploadedAt: issuedAt,
    };

    const student = await this.repository.issueTransferCertificate(
      id,
      sid,
      tcDocument,
      userId
    );
    if (!student) {
      throw new AppError('Transfer certificate issuance failed', 400);
    }

    return {
      student,
      transferCertificate: {
        admissionNo: existing.admissionNo,
        studentName: `${existing.firstName} ${existing.lastName}`,
        reason: input.reason,
        remarks: input.remarks,
        lastAttendanceDate: input.lastAttendanceDate ?? issuedAt,
        issuedAt,
        documentUrl: tcDocument.url,
      },
    };
  }

  async listAlumni(schoolId: string | null, query: PaginationQuery) {
    const sid = this.requireSchoolId(schoolId);
    return this.repository.findAlumni(sid, query);
  }

  async uploadDocument(
    schoolId: string | null,
    userId: string,
    id: string,
    file: Express.Multer.File,
    name: string,
    type: string
  ) {
    const sid = this.requireSchoolId(schoolId);
    const existing = await this.repository.findById(id, sid);
    if (!existing) {
      throw new AppError('Student not found', 404);
    }

    const document = {
      name,
      type,
      url: `/uploads/${path.basename(file.path)}`,
      uploadedAt: new Date(),
    };

    const student = await this.repository.addDocument(id, sid, document, userId);
    if (!student) {
      throw new AppError('Document upload failed', 400);
    }

    return { student, document };
  }
}
