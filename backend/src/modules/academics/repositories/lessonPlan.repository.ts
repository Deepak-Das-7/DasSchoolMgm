import { BaseRepository } from '../../../shared/repositories/base.repository';
import { LessonPlan, ILessonPlan } from '../../../database/models/lessonPlan.model';

class LessonPlanRepository extends BaseRepository<ILessonPlan> {
  constructor() {
    super(LessonPlan);
  }
}

export const lessonPlanRepository = new LessonPlanRepository();
