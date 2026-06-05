import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from '../../../shared/repositories/base.repository';
import { School, ISchool, SchoolStatus } from '../../../database/models';
import { PaginationQuery } from '../../../shared/types/common';

export class SchoolsRepository extends BaseRepository<ISchool> {
  constructor() {
    super(School);
  }

  async findByCode(code: string): Promise<ISchool | null> {
    return School.findOne({ code: code.toUpperCase(), isDeleted: false });
  }

  async findByDomain(domain: string): Promise<ISchool | null> {
    return School.findOne({ domain: domain.toLowerCase(), isDeleted: false });
  }

  async listSchools(
    query: PaginationQuery,
    status?: SchoolStatus
  ): Promise<ReturnType<BaseRepository<ISchool>['findAll']>> {
    const extraFilter: FilterQuery<ISchool> = {};
    if (status) {
      extraFilter.status = status;
    }
    return this.findAll(null, query, ['name', 'code', 'email'], extraFilter);
  }

  async createSchool(data: Partial<ISchool>): Promise<ISchool> {
    return this.create(data);
  }

  async getSchool(id: string): Promise<ISchool | null> {
    return this.findById(id, null);
  }

  async updateSchool(
    id: string,
    data: Partial<ISchool>,
    updatedBy: string
  ): Promise<ISchool | null> {
    return this.update(id, null, data, updatedBy);
  }

  async deleteSchool(id: string, deletedBy: string): Promise<ISchool | null> {
    return this.softDelete(id, null, deletedBy);
  }

  async updateSubscription(
    id: string,
    subscription: ISchool['subscription'],
    updatedBy: string
  ): Promise<ISchool | null> {
    return this.update(id, null, { subscription }, updatedBy);
  }

  async updateBranding(
    id: string,
    branding: ISchool['branding'],
    updatedBy: string
  ): Promise<ISchool | null> {
    return this.update(id, null, { branding }, updatedBy);
  }

  async updateSettings(
    id: string,
    settings: ISchool['settings'],
    updatedBy: string
  ): Promise<ISchool | null> {
    return this.update(id, null, { settings }, updatedBy);
  }

  async mergeBranding(
    id: string,
    branding: Partial<ISchool['branding']>,
    updatedBy: string
  ): Promise<ISchool | null> {
    const school = await this.getSchool(id);
    if (!school) return null;

    return this.update(
      id,
      null,
      { branding: { ...school.branding, ...branding } },
      updatedBy
    );
  }

  async mergeSettings(
    id: string,
    settings: Partial<ISchool['settings']>,
    updatedBy: string
  ): Promise<ISchool | null> {
    const school = await this.getSchool(id);
    if (!school) return null;

    return this.update(
      id,
      null,
      { settings: { ...school.settings, ...settings } },
      updatedBy
    );
  }

  async setCreatedBy(id: string, userId: string): Promise<void> {
    await School.findByIdAndUpdate(id, {
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
  }
}

export const schoolsRepository = new SchoolsRepository();
