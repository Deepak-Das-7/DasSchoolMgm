import { Request, Response, NextFunction } from 'express';
import { examService } from '../services/exam.service';
import { sendSuccess, sendCreated } from '../../../utils/apiResponse';

export class ExamController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await examService.create(req.schoolId ?? null, req.user!.id, req.body);
      sendCreated(res, doc, 'Exam created successfully');
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await examService.list(req.schoolId ?? null, req.query);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await examService.getById(req.schoolId ?? null, req.params.id);
      sendSuccess(res, doc);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await examService.update(
        req.schoolId ?? null,
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, doc, 'Exam updated successfully');
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await examService.remove(req.schoolId ?? null, req.user!.id, req.params.id);
      sendSuccess(res, null, 'Exam deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  enterMarks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await examService.enterMarks(
        req.schoolId ?? null,
        req.user!.id,
        req.params.id,
        req.body.entries
      );
      sendCreated(res, result, 'Marks entered successfully');
    } catch (error) {
      next(error);
    }
  };

  calculateGrades = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await examService.calculateGrades(
        req.schoolId ?? null,
        req.user!.id,
        req.params.id
      );
      sendSuccess(res, result, 'Grades calculated successfully');
    } catch (error) {
      next(error);
    }
  };

  getResults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await examService.getResults(req.schoolId ?? null, req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  getReportCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await examService.getReportCard(
        req.schoolId ?? null,
        req.params.id,
        req.params.studentId
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export const examController = new ExamController();
