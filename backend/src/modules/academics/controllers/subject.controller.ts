import { Request, Response, NextFunction } from 'express';
import { subjectService } from '../services/subject.service';
import { sendSuccess, sendCreated } from '../../../utils/apiResponse';

export class SubjectController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await subjectService.create(req.schoolId ?? null, req.user!.id, req.body);
      sendCreated(res, doc, 'Subject created successfully');
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await subjectService.list(req.schoolId ?? null, req.query);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await subjectService.getById(req.schoolId ?? null, req.params.id);
      sendSuccess(res, doc);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await subjectService.update(
        req.schoolId ?? null,
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, doc, 'Subject updated successfully');
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await subjectService.remove(req.schoolId ?? null, req.user!.id, req.params.id);
      sendSuccess(res, null, 'Subject deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}

export const subjectController = new SubjectController();
