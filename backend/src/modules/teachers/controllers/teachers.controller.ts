import { Request, Response, NextFunction } from 'express';
import { sendCreated, sendSuccess } from '../../../utils/apiResponse';
import { TeacherService } from '../services/teachers.service';

const service = new TeacherService();

export class TeacherController {
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
      const teacher = await service.getById(req.user!.schoolId, req.params.id);
      sendSuccess(res, teacher);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacher = await service.create(req.user!.schoolId, req.user!.id, req.body);
      sendCreated(res, teacher, 'Teacher created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacher = await service.update(
        req.user!.schoolId,
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, teacher, 'Teacher updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacher = await service.remove(req.user!.schoolId, req.user!.id, req.params.id);
      sendSuccess(res, teacher, 'Teacher deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.getAttendance(
        req.user!.schoolId,
        req.params.id,
        req.query as never
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getLeave(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.getLeave(
        req.user!.schoolId,
        req.params.id,
        req.query as never
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const teacherController = new TeacherController();
