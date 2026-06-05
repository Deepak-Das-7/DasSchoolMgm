import { BaseRepository } from '../../../shared/repositories/base.repository';
import { Exam, IExam } from '../../../database/models/exam.model';

class ExamRepository extends BaseRepository<IExam> {
  constructor() {
    super(Exam);
  }
}

export const examRepository = new ExamRepository();
