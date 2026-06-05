import { Model, Document, FilterQuery, UpdateQuery, Types } from 'mongoose';
import { parsePagination, buildPaginatedResult, buildSearchFilter } from '../../utils/pagination';
import { PaginatedResult, PaginationQuery } from '../types/common';

export class BaseRepository<T extends Document> {
  constructor(protected model: Model<T>) {}

  protected baseFilter(schoolId: string | null, extra: FilterQuery<T> = {}): FilterQuery<T> {
    const filter: FilterQuery<T> = { isDeleted: false, ...extra } as FilterQuery<T>;
    if (schoolId) {
      (filter as Record<string, unknown>).schoolId = new Types.ObjectId(schoolId);
    }
    return filter;
  }

  async findById(id: string, schoolId: string | null): Promise<T | null> {
    return this.model.findOne(this.baseFilter(schoolId, { _id: id } as FilterQuery<T>));
  }

  async findAll(
    schoolId: string | null,
    query: PaginationQuery,
    searchFields: string[] = [],
    extraFilter: FilterQuery<T> = {}
  ): Promise<PaginatedResult<T>> {
    const { page, limit, skip, sort } = parsePagination(query);
    const searchFilter = buildSearchFilter(query.search, searchFields);
    const filter = this.baseFilter(schoolId, { ...searchFilter, ...extraFilter } as FilterQuery<T>);

    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit),
      this.model.countDocuments(filter),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = new this.model(data);
    return doc.save();
  }

  async update(
    id: string,
    schoolId: string | null,
    data: UpdateQuery<T>,
    updatedBy: string
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(
      this.baseFilter(schoolId, { _id: id } as FilterQuery<T>),
      { ...data, updatedBy: new Types.ObjectId(updatedBy) },
      { new: true, runValidators: true }
    );
  }

  async softDelete(id: string, schoolId: string | null, deletedBy: string): Promise<T | null> {
    return this.update(id, schoolId, { isDeleted: true } as UpdateQuery<T>, deletedBy);
  }

  async count(schoolId: string | null, extraFilter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(this.baseFilter(schoolId, extraFilter));
  }
}
