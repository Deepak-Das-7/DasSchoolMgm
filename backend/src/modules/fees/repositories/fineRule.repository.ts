import { BaseRepository } from '../../../shared/repositories/base.repository';
import { FineRule, IFineRule } from '../../../database/models/fineRule.model';

class FineRuleRepository extends BaseRepository<IFineRule> {
  constructor() {
    super(FineRule);
  }

  async findActive(schoolId: string | null) {
    return this.model.find(this.baseFilter(schoolId, { isActive: true }));
  }
}

export const fineRuleRepository = new FineRuleRepository();
