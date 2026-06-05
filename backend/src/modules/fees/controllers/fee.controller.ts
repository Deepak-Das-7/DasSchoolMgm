import { Request, Response, NextFunction } from 'express';
import { feeService } from '../services/fee.service';
import { sendSuccess, sendCreated } from '../../../utils/apiResponse';

export class FeeController {
  createFeeStructure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await feeService.createFeeStructure(
        req.schoolId ?? null,
        req.user!.id,
        req.body
      );
      sendCreated(res, doc, 'Fee structure created successfully');
    } catch (error) {
      next(error);
    }
  };

  listFeeStructures = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await feeService.listFeeStructures(req.schoolId ?? null, req.query);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  getFeeStructure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await feeService.getFeeStructure(req.schoolId ?? null, req.params.id);
      sendSuccess(res, doc);
    } catch (error) {
      next(error);
    }
  };

  updateFeeStructure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await feeService.updateFeeStructure(
        req.schoolId ?? null,
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, doc, 'Fee structure updated successfully');
    } catch (error) {
      next(error);
    }
  };

  removeFeeStructure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await feeService.removeFeeStructure(req.schoolId ?? null, req.user!.id, req.params.id);
      sendSuccess(res, null, 'Fee structure deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  recordPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await feeService.recordPayment(
        req.schoolId ?? null,
        req.user!.id,
        req.body
      );
      sendCreated(res, result, 'Payment recorded successfully');
    } catch (error) {
      next(error);
    }
  };

  listPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await feeService.listPayments(req.schoolId ?? null, req.query);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  getReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await feeService.getReceipt(req.schoolId ?? null, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  createDiscount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await feeService.createDiscount(req.schoolId ?? null, req.user!.id, req.body);
      sendCreated(res, doc, 'Discount created successfully');
    } catch (error) {
      next(error);
    }
  };

  createScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await feeService.createScholarship(req.schoolId ?? null, req.user!.id, req.body);
      sendCreated(res, doc, 'Scholarship created successfully');
    } catch (error) {
      next(error);
    }
  };

  createFineRule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await feeService.createFineRule(req.schoolId ?? null, req.user!.id, req.body);
      sendCreated(res, doc, 'Fine rule created successfully');
    } catch (error) {
      next(error);
    }
  };
}

export const feeController = new FeeController();
