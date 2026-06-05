import { Request, Response, NextFunction } from 'express';
import { timetableService } from '../services/timetable.service';
import { sendSuccess, sendCreated } from '../../../utils/apiResponse';

export class TimetableController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await timetableService.create(req.schoolId ?? null, req.user!.id, req.body);
      sendCreated(res, doc, 'Timetable slot created successfully');
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await timetableService.list(req.schoolId ?? null, req.query);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await timetableService.getById(req.schoolId ?? null, req.params.id);
      sendSuccess(res, doc);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await timetableService.update(
        req.schoolId ?? null,
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, doc, 'Timetable slot updated successfully');
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await timetableService.remove(req.schoolId ?? null, req.user!.id, req.params.id);
      sendSuccess(res, null, 'Timetable slot deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await timetableService.generate(
        req.schoolId ?? null,
        req.user!.id,
        req.body
      );
      sendCreated(res, result, 'Timetable generated successfully');
    } catch (error) {
      next(error);
    }
  };

  conflicts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await timetableService.detectConflicts(req.schoolId ?? null, req.query);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export const timetableController = new TimetableController();
