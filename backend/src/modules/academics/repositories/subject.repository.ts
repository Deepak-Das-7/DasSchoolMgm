import { FilterQuery } from 'mongoose';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { Subject, ISubject } from '../../../database/models/subject.model';

class SubjectRepository extends BaseRepository<ISubject> {
  constructor() {
    super(Subject);
  }

  async findByClass(schoolId: string | null, classId: string): Promise<ISubject[]> {
    return this.model.find(
      this.baseFilter(schoolId, { classIds: classId } as FilterQuery<ISubject>)
    );
  }
}

export const subjectRepository = new SubjectRepository();
