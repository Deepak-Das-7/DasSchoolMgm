import { Request, Response, NextFunction } from 'express';
import { classService } from '../services/class.service';
import { sendSuccess, sendCreated } from '../../../utils/apiResponse';

export class ClassController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await classService.create(req.schoolId ?? null, req.user!.id, req.body);
      sendCreated(res, doc, 'Class created successfully');
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await classService.list(req.schoolId ?? null, req.query);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await classService.getById(req.schoolId ?? null, req.params.id);
      sendSuccess(res, doc);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await classService.update(
        req.schoolId ?? null,
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, doc, 'Class updated successfully');
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await classService.remove(req.schoolId ?? null, req.user!.id, req.params.id);
      sendSuccess(res, null, 'Class deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}

export const classController = new ClassController();
