import { Request, Response, NextFunction } from 'express';
import { sendCreated, sendSuccess } from '../../../utils/apiResponse';
import { StudentService } from '../services/students.service';

const service = new StudentService();

export class StudentController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.list(req.user!.schoolId, req.query as never);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async listAlumni(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.listAlumni(req.user!.schoolId, req.query as never);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await service.getById(req.user!.schoolId, req.params.id);
      sendSuccess(res, student);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await service.create(req.user!.schoolId, req.user!.id, req.body);
      sendCreated(res, student, 'Student admitted successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await service.update(
        req.user!.schoolId,
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, student, 'Student updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await service.remove(req.user!.schoolId, req.user!.id, req.params.id);
      sendSuccess(res, student, 'Student deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async promote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await service.promote(
        req.user!.schoolId,
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, student, 'Student promoted successfully');
    } catch (error) {
      next(error);
    }
  }

  async issueTransferCertificate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await service.issueTransferCertificate(
        req.user!.schoolId,
        req.user!.id,
        req.params.id,
        req.body
      );
      sendSuccess(res, result, 'Transfer certificate issued successfully');
    } catch (error) {
      next(error);
    }
  }

  async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'File is required' });
        return;
      }
      const result = await service.uploadDocument(
        req.user!.schoolId,
        req.user!.id,
        req.params.id,
        req.file,
        req.body.name,
        req.body.type
      );
      sendCreated(res, result, 'Document uploaded successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const studentController = new StudentController();
