import { Request, Response } from 'express';
import { CrudService } from '../services/crud.service';
import { Document } from 'mongoose';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';

export function createCrudController<T extends Document>(service: CrudService<T>) {
  return {
    async list(req: Request, res: Response) {
      const result = await service.list(req.user!.schoolId!, req.query as never);
      sendSuccess(res, result);
    },
    async getById(req: Request, res: Response) {
      const doc = await service.getById(req.params.id, req.user!.schoolId!);
      sendSuccess(res, doc);
    },
    async create(req: Request, res: Response) {
      const doc = await service.create(req.user!.schoolId!, req.user!.id, req.body);
      sendCreated(res, doc);
    },
    async update(req: Request, res: Response) {
      const doc = await service.update(req.params.id, req.user!.schoolId!, req.user!.id, req.body);
      sendSuccess(res, doc);
    },
    async remove(req: Request, res: Response) {
      await service.remove(req.params.id, req.user!.schoolId!, req.user!.id);
      sendSuccess(res, null, 'Deleted successfully');
    },
  };
}
