import { Request, Response, NextFunction } from 'express';
import { sendCreated, sendSuccess } from '../../../utils/apiResponse';
import { EmployeeService } from '../services/employees.service';

const service = new EmployeeService();

export class EmployeeController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.list(req.user!.schoolId, req.query as never);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await service.getById(req.user!.schoolId, req.params.id);
      sendSuccess(res, employee);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await service.create(req.user!.schoolId, req.user!.id, req.body);
      sendCreated(res, employee, 'Employee created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await service.update(
        req.user!.schoolId,
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, employee, 'Employee updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await service.remove(req.user!.schoolId, req.user!.id, req.params.id);
      sendSuccess(res, employee, 'Employee deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const employeeController = new EmployeeController();
