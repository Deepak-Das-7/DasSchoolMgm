import { Types, Document, FilterQuery } from 'mongoose';
import { BaseRepository } from '../repositories/base.repository';
import { AppError } from '../../middlewares/error.middleware';
import { PaginationQuery } from '../types/common';

export class CrudService<T extends Document> {
  constructor(
    private repository: BaseRepository<T>,
    private searchFields: string[] = ['name']
  ) {}

  async list(schoolId: string, query: PaginationQuery, extraFilter: FilterQuery<T> = {}) {
    return this.repository.findAll(schoolId, query, this.searchFields, extraFilter);
  }

  async getById(id: string, schoolId: string) {
    const doc = await this.repository.findById(id, schoolId);
    if (!doc) throw new AppError('Resource not found', 404);
    return doc;
  }

  async create(schoolId: string, userId: string, data: Record<string, unknown>) {
    return this.repository.create({
      ...data,
      schoolId: new Types.ObjectId(schoolId),
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    } as never);
  }

  async update(id: string, schoolId: string, userId: string, data: Record<string, unknown>) {
    const doc = await this.repository.update(id, schoolId, data as never, userId);
    if (!doc) throw new AppError('Resource not found', 404);
    return doc;
  }

  async remove(id: string, schoolId: string, userId: string) {
    const doc = await this.repository.softDelete(id, schoolId, userId);
    if (!doc) throw new AppError('Resource not found', 404);
    return doc;
  }
}
