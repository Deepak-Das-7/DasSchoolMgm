import { Types } from 'mongoose';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import {
  IStudent,
  IStudentDocument,
  Student,
  StudentStatus,
} from '../../../database/models/student.model';
import { PaginationQuery } from '../../../shared/types/common';

export class StudentRepository extends BaseRepository<IStudent> {
  constructor() {
    super(Student);
  }

  async findByAdmissionNo(
    admissionNo: string,
    schoolId: string
  ): Promise<IStudent | null> {
    return this.model.findOne(
      this.baseFilter(schoolId, { admissionNo } as Record<string, unknown>)
    );
  }

  async findAlumni(
    schoolId: string,
    query: PaginationQuery
  ) {
    return this.findAll(schoolId, query, ['firstName', 'lastName', 'admissionNo'], {
      status: StudentStatus.ALUMNI,
    });
  }

  async addDocument(
    id: string,
    schoolId: string,
    document: IStudentDocument,
    updatedBy: string
  ): Promise<IStudent | null> {
    return this.model.findOneAndUpdate(
      this.baseFilter(schoolId, { _id: id }),
      {
        $push: { documents: document },
        updatedBy: new Types.ObjectId(updatedBy),
      },
      { new: true, runValidators: true }
    );
  }

  async promote(
    id: string,
    schoolId: string,
    classId: string,
    sectionId: string,
    rollNo: string | undefined,
    updatedBy: string
  ): Promise<IStudent | null> {
    const update: Record<string, unknown> = {
      classId: new Types.ObjectId(classId),
      sectionId: new Types.ObjectId(sectionId),
      updatedBy: new Types.ObjectId(updatedBy),
    };
    if (rollNo !== undefined) {
      update.rollNo = rollNo;
    }
    return this.model.findOneAndUpdate(
      this.baseFilter(schoolId, { _id: id, status: StudentStatus.ACTIVE }),
      update,
      { new: true, runValidators: true }
    );
  }

  async issueTransferCertificate(
    id: string,
    schoolId: string,
    document: IStudentDocument,
    updatedBy: string
  ): Promise<IStudent | null> {
    return this.model.findOneAndUpdate(
      this.baseFilter(schoolId, { _id: id, status: StudentStatus.ACTIVE }),
      {
        status: StudentStatus.TRANSFERRED,
        $push: { documents: document },
        updatedBy: new Types.ObjectId(updatedBy),
      },
      { new: true, runValidators: true }
    );
  }

  async linkParent(
    studentId: string,
    schoolId: string,
    parentId: string,
    updatedBy: string
  ): Promise<IStudent | null> {
    return this.model.findOneAndUpdate(
      this.baseFilter(schoolId, { _id: studentId }),
      {
        $addToSet: { parentIds: new Types.ObjectId(parentId) },
        updatedBy: new Types.ObjectId(updatedBy),
      },
      { new: true, runValidators: true }
    );
  }

  async unlinkParent(
    studentId: string,
    schoolId: string,
    parentId: string,
    updatedBy: string
  ): Promise<IStudent | null> {
    return this.model.findOneAndUpdate(
      this.baseFilter(schoolId, { _id: studentId }),
      {
        $pull: { parentIds: new Types.ObjectId(parentId) },
        updatedBy: new Types.ObjectId(updatedBy),
      },
      { new: true, runValidators: true }
    );
  }

  async getNextAdmissionSequence(schoolId: string): Promise<number> {
    const count = await this.count(schoolId);
    return count + 1;
  }
}
