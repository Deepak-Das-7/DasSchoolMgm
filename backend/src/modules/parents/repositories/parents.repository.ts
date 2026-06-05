import { Types } from 'mongoose';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { IParent, Parent } from '../../../database/models/parent.model';
import { IStudent, Student } from '../../../database/models/student.model';

export class ParentRepository extends BaseRepository<IParent> {
  constructor() {
    super(Parent);
  }

  async findByEmail(email: string, schoolId: string): Promise<IParent | null> {
    return this.model.findOne(
      this.baseFilter(schoolId, { email: email.toLowerCase() } as Record<string, unknown>)
    );
  }

  async findByPhone(phone: string, schoolId: string): Promise<IParent | null> {
    return this.model.findOne(this.baseFilter(schoolId, { phone } as Record<string, unknown>));
  }

  async linkStudent(
    parentId: string,
    schoolId: string,
    studentId: string,
    updatedBy: string
  ): Promise<IParent | null> {
    return this.model.findOneAndUpdate(
      this.baseFilter(schoolId, { _id: parentId }),
      {
        $addToSet: { studentIds: new Types.ObjectId(studentId) },
        updatedBy: new Types.ObjectId(updatedBy),
      },
      { new: true, runValidators: true }
    );
  }

  async findChildren(
    parentId: string,
    schoolId: string
  ): Promise<IStudent[]> {
    const parent = await this.findById(parentId, schoolId);
    if (!parent || parent.studentIds.length === 0) {
      return [];
    }

    return Student.find({
      _id: { $in: parent.studentIds },
      schoolId: new Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('classId', 'name numericOrder')
      .populate('sectionId', 'name');
  }
}
