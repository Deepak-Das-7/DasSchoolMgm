import { Request, Response, NextFunction } from 'express';
import { sendCreated, sendSuccess } from '../../../../utils/apiResponse';
import { resolveSchoolId } from '../../types/schools.types';
import { academicSessionsService } from '../services/academic-sessions.service';

export class AcademicSessionsController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req);
      const session = await academicSessionsService.create(schoolId, req.body, req.user!.id);
      sendCreated(res, session, 'Academic session created successfully');
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req);
      const result = await academicSessionsService.list(
        schoolId,
        req.query as import('../validators/academic-sessions.validators').ListAcademicSessionsQuery
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req);
      const session = await academicSessionsService.getById(schoolId, req.params.id);
      sendSuccess(res, session);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req);
      const session = await academicSessionsService.update(
        schoolId,
        req.params.id,
        req.body,
        req.user!.id
      );
      sendSuccess(res, session, 'Academic session updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = resolveSchoolId(req);
      await academicSessionsService.delete(schoolId, req.params.id, req.user!.id);
      sendSuccess(res, null, 'Academic session deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const academicSessionsController = new AcademicSessionsController();
