import { FilterQuery } from 'mongoose';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { Section, ISection } from '../../../database/models/section.model';

class SectionRepository extends BaseRepository<ISection> {
  constructor() {
    super(Section);
  }

  async findByClass(schoolId: string | null, classId: string): Promise<ISection[]> {
    return this.model
      .find(this.baseFilter(schoolId, { classId } as FilterQuery<ISection>))
      .sort({ name: 1 });
  }
}

export const sectionRepository = new SectionRepository();
