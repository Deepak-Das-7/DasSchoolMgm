import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { Result, IResult } from '../../../database/models/result.model';

class ResultRepository extends BaseRepository<IResult> {
  constructor() {
    super(Result);
  }

  async findByExam(schoolId: string | null, examId: string): Promise<IResult[]> {
    return this.model.find(
      this.baseFilter(schoolId, { examId: new Types.ObjectId(examId) } as FilterQuery<IResult>)
    );
  }

  async findByExamAndStudent(
    schoolId: string | null,
    examId: string,
    studentId: string
  ): Promise<IResult[]> {
    return this.model.find(
      this.baseFilter(schoolId, {
        examId: new Types.ObjectId(examId),
        studentId: new Types.ObjectId(studentId),
      } as FilterQuery<IResult>)
    );
  }

  async bulkUpsert(
    schoolId: string | null,
    userId: string,
    examId: string,
    entries: Array<{
      studentId: string;
      subjectId: string;
      marksObtained: number;
      grade?: string;
      remarks?: string;
    }>
  ): Promise<IResult[]> {
    const schoolObjectId = schoolId ? new Types.ObjectId(schoolId) : null;
    const userObjectId = new Types.ObjectId(userId);
    const examObjectId = new Types.ObjectId(examId);
    const results: IResult[] = [];

    for (const entry of entries) {
      const doc = await this.model.findOneAndUpdate(
        {
          schoolId: schoolObjectId,
          isDeleted: false,
          examId: examObjectId,
          studentId: new Types.ObjectId(entry.studentId),
          subjectId: new Types.ObjectId(entry.subjectId),
        },
        {
          $set: {
            marksObtained: entry.marksObtained,
            grade: entry.grade,
            remarks: entry.remarks,
            updatedBy: userObjectId,
          },
          $setOnInsert: {
            schoolId: schoolObjectId,
            examId: examObjectId,
            studentId: new Types.ObjectId(entry.studentId),
            subjectId: new Types.ObjectId(entry.subjectId),
            createdBy: userObjectId,
            isDeleted: false,
          },
        },
        { upsert: true, new: true, runValidators: true }
      );
      results.push(doc);
    }

    return results;
  }
}

export const resultRepository = new ResultRepository();
