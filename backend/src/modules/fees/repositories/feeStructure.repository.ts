import { BaseRepository } from '../../../shared/repositories/base.repository';
import { FeeStructure, IFeeStructure } from '../../../database/models/feeStructure.model';

class FeeStructureRepository extends BaseRepository<IFeeStructure> {
  constructor() {
    super(FeeStructure);
  }
}

export const feeStructureRepository = new FeeStructureRepository();
