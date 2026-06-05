import { Request, Response, NextFunction } from 'express';
import { sendCreated, sendSuccess } from '../../../utils/apiResponse';
import { schoolsService } from '../services/schools.service';

export class SchoolsController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await schoolsService.createSchool(req.body, req.user!.id);
      sendCreated(res, school, 'School created successfully');
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await schoolsService.listSchools(
        req.query as import('../validators/schools.validators').ListSchoolsQuery
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await schoolsService.getSchoolById(req, req.params.id);
      sendSuccess(res, school);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await schoolsService.updateSchool(req, req.params.id, req.body);
      sendSuccess(res, school, 'School updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await schoolsService.deleteSchool(req.params.id, req.user!.id);
      sendSuccess(res, null, 'School deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await schoolsService.updateSubscription(
        req.params.id,
        req.body,
        req.user!.id
      );
      sendSuccess(res, school, 'Subscription updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateBranding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await schoolsService.updateBranding(req, req.params.id, req.body);
      sendSuccess(res, school, 'Branding updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await schoolsService.updateSettings(req, req.params.id, req.body);
      sendSuccess(res, school, 'Settings updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await schoolsService.getProfile(req);
      sendSuccess(res, school);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const school = await schoolsService.updateProfile(req, req.body);
      sendSuccess(res, school, 'School profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const schoolsController = new SchoolsController();
