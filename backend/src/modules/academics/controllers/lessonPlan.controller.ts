import { Request, Response, NextFunction } from 'express';
import { lessonPlanService } from '../services/lessonPlan.service';
import { sendSuccess, sendCreated } from '../../../utils/apiResponse';

export class LessonPlanController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await lessonPlanService.create(req.schoolId ?? null, req.user!.id, req.body);
      sendCreated(res, doc, 'Lesson plan created successfully');
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await lessonPlanService.list(req.schoolId ?? null, req.query);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await lessonPlanService.getById(req.schoolId ?? null, req.params.id);
      sendSuccess(res, doc);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await lessonPlanService.update(
        req.schoolId ?? null,
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, doc, 'Lesson plan updated successfully');
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await lessonPlanService.remove(req.schoolId ?? null, req.user!.id, req.params.id);
      sendSuccess(res, null, 'Lesson plan deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}

export const lessonPlanController = new LessonPlanController();
