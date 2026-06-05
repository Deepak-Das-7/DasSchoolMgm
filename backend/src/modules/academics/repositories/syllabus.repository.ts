import { BaseRepository } from '../../../shared/repositories/base.repository';
import { Syllabus, ISyllabus } from '../../../database/models/syllabus.model';

class SyllabusRepository extends BaseRepository<ISyllabus> {
  constructor() {
    super(Syllabus);
  }
}

export const syllabusRepository = new SyllabusRepository();
