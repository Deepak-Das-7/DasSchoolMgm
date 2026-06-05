import { Types } from 'mongoose';
import { AppError } from '../../../middlewares/error.middleware';
import { feeStructureRepository } from '../repositories/feeStructure.repository';
import { paymentRepository } from '../repositories/payment.repository';
import { feeDiscountRepository } from '../repositories/feeDiscount.repository';
import { scholarshipRepository } from '../repositories/scholarship.repository';
import { fineRuleRepository } from '../repositories/fineRule.repository';
import { buildAuditFields } from '../../shared/context';
import { PaginationQuery } from '../../../shared/types/common';
import { IFeeComponent } from '../../../database/models/feeStructure.model';
import {
  PaymentStatus,
  PaymentMethod,
} from '../../../database/models/payment.model';
import { DiscountType } from '../../../database/models/feeDiscount.model';
import { FineType } from '../../../database/models/fineRule.model';
import { Student } from '../../../database/models/student.model';
import { School } from '../../../database/models/school.model';

export class FeeService {
  async createFeeStructure(
    schoolId: string | null,
    userId: string,
    data: {
      name: string;
      classId: string;
      sessionId: string;
      components: IFeeComponent[];
      totalAmount: number;
      dueDate: Date;
    }
  ) {
    const componentTotal = data.components.reduce((sum, c) => sum + c.amount, 0);
    if (Math.abs(componentTotal - data.totalAmount) > 0.01) {
      throw new AppError(
        `Total amount (${data.totalAmount}) must match sum of components (${componentTotal})`,
        400
      );
    }

    return feeStructureRepository.create({
      name: data.name,
      classId: new Types.ObjectId(data.classId),
      sessionId: new Types.ObjectId(data.sessionId),
      components: data.components,
      totalAmount: data.totalAmount,
      dueDate: data.dueDate,
      ...buildAuditFields(userId, schoolId),
    });
  }

  async listFeeStructures(
    schoolId: string | null,
    query: PaginationQuery & { classId?: string; sessionId?: string }
  ) {
    const extra: Record<string, unknown> = {};
    if (query.classId) extra.classId = new Types.ObjectId(query.classId);
    if (query.sessionId) extra.sessionId = new Types.ObjectId(query.sessionId);
    return feeStructureRepository.findAll(schoolId, query, ['name'], extra);
  }

  async getFeeStructure(schoolId: string | null, id: string) {
    const doc = await feeStructureRepository.findById(id, schoolId);
    if (!doc) throw new AppError('Fee structure not found', 404);
    return doc;
  }

  async updateFeeStructure(
    schoolId: string | null,
    userId: string,
    id: string,
    data: Partial<{
      name: string;
      classId: string;
      sessionId: string;
      components: IFeeComponent[];
      totalAmount: number;
      dueDate: Date;
    }>
  ) {
    if (data.components && data.totalAmount !== undefined) {
      const componentTotal = data.components.reduce((sum, c) => sum + c.amount, 0);
      if (Math.abs(componentTotal - data.totalAmount) > 0.01) {
        throw new AppError('Total amount must match sum of components', 400);
      }
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.classId) updateData.classId = new Types.ObjectId(data.classId);
    if (data.sessionId) updateData.sessionId = new Types.ObjectId(data.sessionId);

    const doc = await feeStructureRepository.update(id, schoolId, updateData, userId);
    if (!doc) throw new AppError('Fee structure not found', 404);
    return doc;
  }

  async removeFeeStructure(schoolId: string | null, userId: string, id: string) {
    const doc = await feeStructureRepository.softDelete(id, schoolId, userId);
    if (!doc) throw new AppError('Fee structure not found', 404);
    return doc;
  }

  async recordPayment(
    schoolId: string | null,
    userId: string,
    data: {
      studentId: string;
      feeStructureId: string;
      amount: number;
      paidAmount: number;
      paymentMethod?: PaymentMethod;
      transactionId?: string;
      discountId?: string;
      scholarshipId?: string;
    }
  ) {
    const [student, feeStructure] = await Promise.all([
      Student.findOne({
        _id: data.studentId,
        isDeleted: false,
        ...(schoolId ? { schoolId: new Types.ObjectId(schoolId) } : {}),
      }),
      this.getFeeStructure(schoolId, data.feeStructureId),
    ]);

    if (!student) throw new AppError('Student not found', 404);

    let payableAmount = data.amount;
    let discountApplied = 0;
    let scholarshipApplied = 0;

    if (data.discountId) {
      const discount = await feeDiscountRepository.findById(data.discountId, schoolId);
      if (!discount || !discount.isActive) {
        throw new AppError('Discount not found or inactive', 404);
      }
      this.validateDateRange(discount.validFrom, discount.validTo);
      if (
        discount.classIds.length &&
        !discount.classIds.some((id) => id.toString() === student.classId.toString())
      ) {
        throw new AppError('Discount not applicable to student class', 400);
      }
      discountApplied = this.applyReduction(payableAmount, discount.type, discount.value);
      payableAmount -= discountApplied;
    }

    if (data.scholarshipId) {
      const scholarship = await scholarshipRepository.findById(data.scholarshipId, schoolId);
      if (!scholarship || !scholarship.isActive) {
        throw new AppError('Scholarship not found or inactive', 404);
      }
      this.validateDateRange(scholarship.validFrom, scholarship.validTo);
      scholarshipApplied = this.applyReduction(payableAmount, scholarship.type, scholarship.value);
      payableAmount -= scholarshipApplied;
    }

    const fineAmount = await this.calculateFine(schoolId, feeStructure, payableAmount);
    payableAmount += fineAmount;

    if (data.paidAmount > payableAmount) {
      throw new AppError(`Paid amount cannot exceed payable amount (${payableAmount})`, 400);
    }

    const status = this.resolvePaymentStatus(payableAmount, data.paidAmount);
    const receiptNo = await paymentRepository.generateReceiptNo(schoolId);

    const payment = await paymentRepository.create({
      studentId: new Types.ObjectId(data.studentId),
      feeStructureId: new Types.ObjectId(data.feeStructureId),
      amount: payableAmount,
      paidAmount: data.paidAmount,
      status,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      receiptNo,
      ...buildAuditFields(userId, schoolId),
    });

    return {
      payment,
      breakdown: {
        baseAmount: data.amount,
        discountApplied,
        scholarshipApplied,
        fineAmount,
        payableAmount,
      },
    };
  }

  async listPayments(
    schoolId: string | null,
    query: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      studentId?: string;
      feeStructureId?: string;
      status?: PaymentStatus;
    }
  ) {
    return paymentRepository.findWithFilters(schoolId, query);
  }

  async getReceipt(schoolId: string | null, paymentId: string) {
    const payment = await paymentRepository.findById(paymentId, schoolId);
    if (!payment) throw new AppError('Payment not found', 404);

    const [student, feeStructure, school] = await Promise.all([
      Student.findById(payment.studentId).lean(),
      feeStructureRepository.findById(payment.feeStructureId.toString(), schoolId),
      schoolId ? School.findById(schoolId).lean() : null,
    ]);

    if (!student || !feeStructure) {
      throw new AppError('Receipt data incomplete', 404);
    }

    return {
      receiptNo: payment.receiptNo,
      issuedAt: payment.updatedAt,
      school: school
        ? { name: school.name, code: school.code, address: school.address }
        : null,
      student: {
        id: student._id,
        admissionNo: student.admissionNo,
        name: `${student.firstName} ${student.lastName}`,
        classId: student.classId,
        sectionId: student.sectionId,
      },
      feeStructure: {
        id: feeStructure._id,
        name: feeStructure.name,
        components: feeStructure.components,
        dueDate: feeStructure.dueDate,
      },
      payment: {
        id: payment._id,
        amount: payment.amount,
        paidAmount: payment.paidAmount,
        balance: Math.max(0, payment.amount - payment.paidAmount),
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
      },
    };
  }

  async createDiscount(
    schoolId: string | null,
    userId: string,
    data: {
      name: string;
      type: DiscountType;
      value: number;
      classIds?: string[];
      validFrom: Date;
      validTo?: Date;
      isActive?: boolean;
      description?: string;
    }
  ) {
    this.validateDiscountValue(data.type, data.value);
    return feeDiscountRepository.create({
      name: data.name,
      type: data.type,
      value: data.value,
      classIds: (data.classIds ?? []).map((id) => new Types.ObjectId(id)),
      validFrom: data.validFrom,
      validTo: data.validTo,
      isActive: data.isActive ?? true,
      description: data.description,
      ...buildAuditFields(userId, schoolId),
    });
  }

  async createScholarship(
    schoolId: string | null,
    userId: string,
    data: {
      name: string;
      type: DiscountType;
      value: number;
      criteria?: string;
      maxRecipients?: number;
      validFrom: Date;
      validTo?: Date;
      isActive?: boolean;
    }
  ) {
    this.validateDiscountValue(data.type, data.value);
    return scholarshipRepository.create({
      name: data.name,
      type: data.type,
      value: data.value,
      criteria: data.criteria,
      maxRecipients: data.maxRecipients,
      validFrom: data.validFrom,
      validTo: data.validTo,
      isActive: data.isActive ?? true,
      ...buildAuditFields(userId, schoolId),
    });
  }

  async createFineRule(
    schoolId: string | null,
    userId: string,
    data: {
      name: string;
      type: FineType;
      value: number;
      gracePeriodDays?: number;
      applicableComponents?: string[];
      isActive?: boolean;
      description?: string;
    }
  ) {
    return fineRuleRepository.create({
      name: data.name,
      type: data.type,
      value: data.value,
      gracePeriodDays: data.gracePeriodDays ?? 0,
      applicableComponents: data.applicableComponents ?? [],
      isActive: data.isActive ?? true,
      description: data.description,
      ...buildAuditFields(userId, schoolId),
    });
  }

  private applyReduction(amount: number, type: DiscountType, value: number): number {
    if (type === DiscountType.PERCENTAGE) {
      return Math.round((amount * Math.min(value, 100)) / 100 * 100) / 100;
    }
    return Math.min(value, amount);
  }

  private validateDiscountValue(type: DiscountType, value: number): void {
    if (type === DiscountType.PERCENTAGE && value > 100) {
      throw new AppError('Percentage discount cannot exceed 100', 400);
    }
  }

  private validateDateRange(validFrom: Date, validTo?: Date): void {
    const now = new Date();
    if (now < validFrom) throw new AppError('Fee rule is not yet valid', 400);
    if (validTo && now > validTo) throw new AppError('Fee rule has expired', 400);
  }

  private resolvePaymentStatus(payableAmount: number, paidAmount: number): PaymentStatus {
    if (paidAmount <= 0) return PaymentStatus.PENDING;
    if (paidAmount >= payableAmount) return PaymentStatus.PAID;
    return PaymentStatus.PARTIAL;
  }

  private async calculateFine(
    schoolId: string | null,
    feeStructure: { dueDate: Date; totalAmount: number; components: Array<{ name: string }> },
    baseAmount: number
  ): Promise<number> {
    const rules = await fineRuleRepository.findActive(schoolId);

    if (!rules.length) return 0;

    const now = new Date();
    const dueDate = new Date(feeStructure.dueDate);
    if (now <= dueDate) return 0;

    const daysOverdue = Math.floor(
      (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let totalFine = 0;

    for (const rule of rules) {
      if (daysOverdue <= rule.gracePeriodDays) continue;

      const effectiveDays = daysOverdue - rule.gracePeriodDays;

      switch (rule.type) {
        case FineType.DAILY:
          totalFine += rule.value * effectiveDays;
          break;
        case FineType.FIXED:
          totalFine += rule.value;
          break;
        case FineType.PERCENTAGE:
          totalFine += (baseAmount * rule.value) / 100;
          break;
      }
    }

    return Math.round(totalFine * 100) / 100;
  }
}

export const feeService = new FeeService();
