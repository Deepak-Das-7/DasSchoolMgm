import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import {
  Payment,
  IPayment,
  PaymentStatus,
} from '../../../database/models/payment.model';
import { PaginationQuery } from '../../../shared/types/common';
import { parsePagination, buildPaginatedResult } from '../../../utils/pagination';

export interface PaymentListQuery extends PaginationQuery {
  studentId?: string;
  feeStructureId?: string;
  status?: PaymentStatus;
}

class PaymentRepository extends BaseRepository<IPayment> {
  constructor() {
    super(Payment);
  }

  async findWithFilters(schoolId: string | null, query: PaymentListQuery) {
    const { page, limit, skip, sort } = parsePagination(query);
    const extra: FilterQuery<IPayment> = {};

    if (query.studentId) extra.studentId = new Types.ObjectId(query.studentId);
    if (query.feeStructureId) {
      extra.feeStructureId = new Types.ObjectId(query.feeStructureId);
    }
    if (query.status) extra.status = query.status;

    const filter = this.baseFilter(schoolId, extra);
    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit),
      this.model.countDocuments(filter),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }

  async generateReceiptNo(schoolId: string | null): Promise<string> {
    const prefix = schoolId ? schoolId.slice(-6).toUpperCase() : 'GLOBAL';
    const count = await this.count(schoolId);
    const timestamp = Date.now().toString(36).toUpperCase();
    return `RCP-${prefix}-${count + 1}-${timestamp}`;
  }
}

export const paymentRepository = new PaymentRepository();
