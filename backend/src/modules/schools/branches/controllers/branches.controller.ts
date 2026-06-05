import { Request, Response, NextFunction } from 'express';
import { sendCreated, sendSuccess } from '../../../../utils/apiResponse';
import { resolveSchoolId } from '../../types/schools.types';
import { branchesService } from '../services/branches.service';

export class BranchesController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req);
      const branch = await branchesService.create(schoolId, req.body, req.user!.id);
      sendCreated(res, branch, 'Branch created successfully');
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req);
      const result = await branchesService.list(
        schoolId,
        req.query as import('../validators/branches.validators').ListBranchesQuery
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req);
      const branch = await branchesService.getById(schoolId, req.params.id);
      sendSuccess(res, branch);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req);
      const branch = await branchesService.update(
        schoolId,
        req.params.id,
        req.body,
        req.user!.id
      );
      sendSuccess(res, branch, 'Branch updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req);
      await branchesService.delete(schoolId, req.params.id, req.user!.id);
      sendSuccess(res, null, 'Branch deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const branchesController = new BranchesController();
