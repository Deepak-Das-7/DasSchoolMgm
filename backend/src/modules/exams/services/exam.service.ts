import { Types } from 'mongoose';
import { AppError } from '../../../middlewares/error.middleware';
import { examRepository } from '../repositories/exam.repository';
import { resultRepository } from '../repositories/result.repository';
import { buildAuditFields } from '../../shared/context';
import { PaginationQuery } from '../../../shared/types/common';
import { IExam, IExamSubject } from '../../../database/models/exam.model';
import { Student } from '../../../database/models/student.model';
import { Subject } from '../../../database/models/subject.model';
import {
  calculateGradeFromMarks,
  calculateGradeFromPercentage,
  isPassed,
} from '../utils/gradeCalculator';

export class ExamService {
  async create(
    schoolId: string | null,
    userId: string,
    data: {
      name: string;
      type: string;
      classId: string;
      sessionId: string;
      startDate: Date;
      endDate: Date;
      subjects?: IExamSubject[];
      maxMarks: number;
      passingMarks: number;
    }
  ) {
    return examRepository.create({
      name: data.name,
      type: data.type,
      classId: new Types.ObjectId(data.classId),
      sessionId: new Types.ObjectId(data.sessionId),
      startDate: data.startDate,
      endDate: data.endDate,
      subjects: (data.subjects ?? []).map((s) => ({
        subjectId: new Types.ObjectId(s.subjectId.toString()),
        maxMarks: s.maxMarks,
        passingMarks: s.passingMarks,
      })),
      maxMarks: data.maxMarks,
      passingMarks: data.passingMarks,
      ...buildAuditFields(userId, schoolId),
    });
  }

  async list(
    schoolId: string | null,
    query: PaginationQuery & { classId?: string; sessionId?: string }
  ) {
    const extra: Record<string, unknown> = {};
    if (query.classId) extra.classId = new Types.ObjectId(query.classId);
    if (query.sessionId) extra.sessionId = new Types.ObjectId(query.sessionId);
    return examRepository.findAll(schoolId, query, ['name', 'type'], extra);
  }

  async getById(schoolId: string | null, id: string) {
    const doc = await examRepository.findById(id, schoolId);
    if (!doc) throw new AppError('Exam not found', 404);
    return doc;
  }

  async update(
    schoolId: string | null,
    userId: string,
    id: string,
    data: Partial<{
      name: string;
      type: string;
      classId: string;
      sessionId: string;
      startDate: Date;
      endDate: Date;
      subjects: IExamSubject[];
      maxMarks: number;
      passingMarks: number;
    }>
  ) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.classId) updateData.classId = new Types.ObjectId(data.classId);
    if (data.sessionId) updateData.sessionId = new Types.ObjectId(data.sessionId);
    if (data.subjects) {
      updateData.subjects = data.subjects.map((s) => ({
        subjectId: new Types.ObjectId(s.subjectId.toString()),
        maxMarks: s.maxMarks,
        passingMarks: s.passingMarks,
      }));
    }

    const doc = await examRepository.update(id, schoolId, updateData, userId);
    if (!doc) throw new AppError('Exam not found', 404);
    return doc;
  }

  async remove(schoolId: string | null, userId: string, id: string) {
    const doc = await examRepository.softDelete(id, schoolId, userId);
    if (!doc) throw new AppError('Exam not found', 404);
    return doc;
  }

  async enterMarks(
    schoolId: string | null,
    userId: string,
    examId: string,
    entries: Array<{
      studentId: string;
      subjectId: string;
      marksObtained: number;
      remarks?: string;
    }>
  ) {
    const exam = await this.getById(schoolId, examId);
    const subjectMaxMarks = this.getSubjectMaxMarksMap(exam);

    const enriched = entries.map((entry) => {
      const maxMarks = subjectMaxMarks.get(entry.subjectId) ?? exam.maxMarks;
      if (entry.marksObtained > maxMarks) {
        throw new AppError(
          `Marks for subject ${entry.subjectId} cannot exceed ${maxMarks}`,
          400
        );
      }
      return {
        ...entry,
        grade: calculateGradeFromMarks(entry.marksObtained, maxMarks),
      };
    });

    return resultRepository.bulkUpsert(schoolId, userId, examId, enriched);
  }

  async calculateGrades(schoolId: string | null, userId: string, examId: string) {
    const exam = await this.getById(schoolId, examId);
    const results = await resultRepository.findByExam(schoolId, examId);
    const subjectMaxMarks = this.getSubjectMaxMarksMap(exam);

    const updated = [];
    for (const result of results) {
      const maxMarks =
        subjectMaxMarks.get(result.subjectId.toString()) ?? exam.maxMarks;
      const grade = calculateGradeFromMarks(result.marksObtained, maxMarks);
      const doc = await resultRepository.update(
        result._id.toString(),
        schoolId,
        { grade },
        userId
      );
      if (doc) updated.push(doc);
    }

    return updated;
  }

  async getResults(schoolId: string | null, examId: string) {
    const exam = await this.getById(schoolId, examId);
    const results = await resultRepository.findByExam(schoolId, examId);
    const subjectMaxMarks = this.getSubjectMaxMarksMap(exam);
    const passingMarksMap = this.getSubjectPassingMarksMap(exam);

    const studentMap = new Map<
      string,
      {
        studentId: string;
        subjects: Array<{
          subjectId: string;
          marksObtained: number;
          maxMarks: number;
          grade: string;
          passed: boolean;
          remarks?: string;
        }>;
        totalObtained: number;
        totalMax: number;
        percentage: number;
        overallGrade: string;
        passed: boolean;
        rank?: number;
      }
    >();

    for (const result of results) {
      const studentId = result.studentId.toString();
      const subjectId = result.subjectId.toString();
      const maxMarks = subjectMaxMarks.get(subjectId) ?? exam.maxMarks;
      const passingMarks = passingMarksMap.get(subjectId) ?? exam.passingMarks;
      const grade = result.grade ?? calculateGradeFromMarks(result.marksObtained, maxMarks);

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          studentId,
          subjects: [],
          totalObtained: 0,
          totalMax: 0,
          percentage: 0,
          overallGrade: 'F',
          passed: true,
        });
      }

      const entry = studentMap.get(studentId)!;
      const subjectPassed = isPassed(result.marksObtained, passingMarks);
      entry.subjects.push({
        subjectId,
        marksObtained: result.marksObtained,
        maxMarks,
        grade,
        passed: subjectPassed,
        remarks: result.remarks,
      });
      entry.totalObtained += result.marksObtained;
      entry.totalMax += maxMarks;
      if (!subjectPassed) entry.passed = false;
    }

    const ranked = Array.from(studentMap.values()).map((entry) => {
      entry.percentage =
        entry.totalMax > 0
          ? Math.round((entry.totalObtained / entry.totalMax) * 10000) / 100
          : 0;
      entry.overallGrade = calculateGradeFromPercentage(entry.percentage);
      return entry;
    });

    ranked.sort((a, b) => b.totalObtained - a.totalObtained);

    let currentRank = 0;
    let lastScore = -1;
    for (let i = 0; i < ranked.length; i++) {
      if (ranked[i].totalObtained !== lastScore) {
        currentRank = i + 1;
        lastScore = ranked[i].totalObtained;
      }
      ranked[i].rank = currentRank;
    }

    return {
      exam: {
        id: exam._id,
        name: exam.name,
        type: exam.type,
        classId: exam.classId,
        sessionId: exam.sessionId,
      },
      results: ranked,
    };
  }

  async getReportCard(schoolId: string | null, examId: string, studentId: string) {
    const exam = await this.getById(schoolId, examId);
    const [student, results, allResults] = await Promise.all([
      Student.findOne({
        _id: studentId,
        isDeleted: false,
        ...(schoolId ? { schoolId: new Types.ObjectId(schoolId) } : {}),
      }),
      resultRepository.findByExamAndStudent(schoolId, examId, studentId),
      this.getResults(schoolId, examId),
    ]);

    if (!student) throw new AppError('Student not found', 404);
    if (!results.length) throw new AppError('No results found for this student', 404);

    const subjectIds = results.map((r) => r.subjectId);
    const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean();
    const subjectNameMap = new Map(subjects.map((s) => [s._id.toString(), s.name]));

    const subjectMaxMarks = this.getSubjectMaxMarksMap(exam);
    const passingMarksMap = this.getSubjectPassingMarksMap(exam);

    const subjectResults = results.map((r) => {
      const subjectId = r.subjectId.toString();
      const maxMarks = subjectMaxMarks.get(subjectId) ?? exam.maxMarks;
      const passingMarks = passingMarksMap.get(subjectId) ?? exam.passingMarks;
      const grade = r.grade ?? calculateGradeFromMarks(r.marksObtained, maxMarks);
      return {
        subjectId,
        subjectName: subjectNameMap.get(subjectId) ?? 'Unknown',
        marksObtained: r.marksObtained,
        maxMarks,
        passingMarks,
        grade,
        passed: isPassed(r.marksObtained, passingMarks),
        remarks: r.remarks,
      };
    });

    const totalObtained = subjectResults.reduce((sum, s) => sum + s.marksObtained, 0);
    const totalMax = subjectResults.reduce((sum, s) => sum + s.maxMarks, 0);
    const percentage =
      totalMax > 0 ? Math.round((totalObtained / totalMax) * 10000) / 100 : 0;
    const studentRanking = allResults.results.find((r) => r.studentId === studentId);

    return {
      exam: {
        id: exam._id,
        name: exam.name,
        type: exam.type,
        startDate: exam.startDate,
        endDate: exam.endDate,
      },
      student: {
        id: student._id,
        admissionNo: student.admissionNo,
        name: `${student.firstName} ${student.lastName}`,
        classId: student.classId,
        sectionId: student.sectionId,
        rollNo: student.rollNo,
      },
      subjects: subjectResults,
      summary: {
        totalObtained,
        totalMax,
        percentage,
        overallGrade: calculateGradeFromPercentage(percentage),
        passed: subjectResults.every((s) => s.passed),
        rank: studentRanking?.rank ?? null,
      },
      generatedAt: new Date(),
    };
  }

  private getSubjectMaxMarksMap(exam: IExam): Map<string, number> {
    const map = new Map<string, number>();
    for (const subject of exam.subjects) {
      map.set(subject.subjectId.toString(), subject.maxMarks);
    }
    return map;
  }

  private getSubjectPassingMarksMap(exam: IExam): Map<string, number> {
    const map = new Map<string, number>();
    for (const subject of exam.subjects) {
      map.set(subject.subjectId.toString(), subject.passingMarks);
    }
    return map;
  }
}

export const examService = new ExamService();
