import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendance.service';
import { sendSuccess, sendCreated } from '../../../utils/apiResponse';

export class AttendanceController {
  mark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await attendanceService.markBulk(
        req.schoolId ?? null,
        req.user!.id,
        req.body
      );
      sendCreated(res, result, 'Attendance marked successfully');
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await attendanceService.list(req.schoolId ?? null, req.query);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  monthlyReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await attendanceService.monthlyReport(
        req.schoolId ?? null,
        req.query as unknown as Parameters<typeof attendanceService.monthlyReport>[1]
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  summaryReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await attendanceService.summaryReport(
        req.schoolId ?? null,
        req.query as unknown as Parameters<typeof attendanceService.summaryReport>[1]
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export const attendanceController = new AttendanceController();
