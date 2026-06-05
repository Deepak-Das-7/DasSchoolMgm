import { BaseRepository } from '../../../shared/repositories/base.repository';
import { FeeDiscount, IFeeDiscount } from '../../../database/models/feeDiscount.model';

class FeeDiscountRepository extends BaseRepository<IFeeDiscount> {
  constructor() {
    super(FeeDiscount);
  }
}

export const feeDiscountRepository = new FeeDiscountRepository();
