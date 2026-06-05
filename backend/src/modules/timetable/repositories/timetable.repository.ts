import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { Timetable, ITimetable, WeekDay } from '../../../database/models/timetable.model';

class TimetableRepository extends BaseRepository<ITimetable> {
  constructor() {
    super(Timetable);
  }

  async findFiltered(
    schoolId: string | null,
    extra: FilterQuery<ITimetable> = {}
  ): Promise<ITimetable[]> {
    return this.model.find(this.baseFilter(schoolId, extra));
  }

  async findByDayAndSection(
    schoolId: string | null,
    sectionId: string,
    day: WeekDay,
    excludeId?: string
  ): Promise<ITimetable | null> {
    const filter: FilterQuery<ITimetable> = {
      sectionId: new Types.ObjectId(sectionId),
      day,
    } as FilterQuery<ITimetable>;
    if (excludeId) (filter as Record<string, unknown>)._id = { $ne: new Types.ObjectId(excludeId) };
    return this.model.findOne(this.baseFilter(schoolId, filter));
  }
}

export const timetableRepository = new TimetableRepository();
