import { Request, Response, NextFunction } from 'express';
import { sectionService } from '../services/section.service';
import { sendSuccess, sendCreated } from '../../../utils/apiResponse';

export class SectionController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await sectionService.create(req.schoolId ?? null, req.user!.id, req.body);
      sendCreated(res, doc, 'Section created successfully');
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await sectionService.list(req.schoolId ?? null, req.query);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await sectionService.getById(req.schoolId ?? null, req.params.id);
      sendSuccess(res, doc);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await sectionService.update(
        req.schoolId ?? null,
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, doc, 'Section updated successfully');
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await sectionService.remove(req.schoolId ?? null, req.user!.id, req.params.id);
      sendSuccess(res, null, 'Section deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}

export const sectionController = new SectionController();
