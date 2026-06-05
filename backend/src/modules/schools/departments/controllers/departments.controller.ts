import { Request, Response, NextFunction } from 'express';
import { sendCreated, sendSuccess } from '../../../../utils/apiResponse';
import { resolveSchoolId } from '../../types/schools.types';
import { departmentsService } from '../services/departments.service';

export class DepartmentsController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req);
      const department = await departmentsService.create(schoolId, req.body, req.user!.id);
      sendCreated(res, department, 'Department created successfully');
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req);
      const result = await departmentsService.list(
        schoolId,
        req.query as import('../validators/departments.validators').ListDepartmentsQuery
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req);
      const department = await departmentsService.getById(schoolId, req.params.id);
      sendSuccess(res, department);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req);
      const department = await departmentsService.update(
        schoolId,
        req.params.id,
        req.body,
        req.user!.id
      );
      sendSuccess(res, department, 'Department updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req);
      await departmentsService.delete(schoolId, req.params.id, req.user!.id);
      sendSuccess(res, null, 'Department deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const departmentsController = new DepartmentsController();
