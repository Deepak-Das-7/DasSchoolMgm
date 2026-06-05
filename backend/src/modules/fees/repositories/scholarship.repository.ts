import { BaseRepository } from '../../../shared/repositories/base.repository';
import { Scholarship, IScholarship } from '../../../database/models/scholarship.model';

class ScholarshipRepository extends BaseRepository<IScholarship> {
  constructor() {
    super(Scholarship);
  }
}

export const scholarshipRepository = new ScholarshipRepository();
