import { FilterQuery } from 'mongoose';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { Class, IClass } from '../../../database/models/class.model';

class ClassRepository extends BaseRepository<IClass> {
  constructor() {
    super(Class);
  }

  async findBySession(
    schoolId: string | null,
    sessionId: string,
    extra: FilterQuery<IClass> = {}
  ): Promise<IClass[]> {
    return this.model
      .find(this.baseFilter(schoolId, { sessionId, ...extra } as FilterQuery<IClass>))
      .sort({ numericOrder: 1 });
  }
}

export const classRepository = new ClassRepository();
