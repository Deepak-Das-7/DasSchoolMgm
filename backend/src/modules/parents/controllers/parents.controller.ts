import { Request, Response, NextFunction } from 'express';
import { sendCreated, sendSuccess } from '../../../utils/apiResponse';
import { ParentService } from '../services/parents.service';

const service = new ParentService();

export class ParentController {
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
      const parent = await service.getById(req.user!.schoolId, req.params.id);
      sendSuccess(res, parent);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parent = await service.create(req.user!.schoolId, req.user!.id, req.body);
      sendCreated(res, parent, 'Parent created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parent = await service.update(
        req.user!.schoolId,
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, parent, 'Parent updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parent = await service.remove(req.user!.schoolId, req.user!.id, req.params.id);
      sendSuccess(res, parent, 'Parent deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getChildren(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.getChildren(req.user!.schoolId, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async linkStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.linkStudent(
        req.user!.schoolId,
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, result, 'Student linked successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const parentController = new ParentController();
