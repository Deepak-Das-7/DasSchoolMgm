import { Request } from 'express';
import { Types } from 'mongoose';
import { AppError } from '../../../middlewares/error.middleware';
import { ISchool } from '../../../database/models';
import { PaginatedResult } from '../../../shared/types/common';
import { schoolsRepository } from '../repositories/schools.repository';
import { SchoolResponse, assertSchoolAccess } from '../types/schools.types';
import {
  CreateSchoolInput,
  ListSchoolsQuery,
  UpdateBrandingInput,
  UpdateSchoolInput,
  UpdateSettingsInput,
  UpdateSubscriptionInput,
} from '../validators/schools.validators';

function toSchoolResponse(school: ISchool): SchoolResponse {
  return {
    id: school._id.toString(),
    name: school.name,
    code: school.code,
    email: school.email,
    phone: school.phone,
    address: school.address,
    subscription: school.subscription,
    branding: school.branding,
    domain: school.domain,
    settings: school.settings,
    status: school.status,
    createdAt: school.createdAt,
    updatedAt: school.updatedAt,
  };
}

export class SchoolsService {
  async createSchool(input: CreateSchoolInput, createdBy: string): Promise<SchoolResponse> {
    const existingCode = await schoolsRepository.findByCode(input.code);
    if (existingCode) {
      throw new AppError('School code already exists', 409);
    }

    if (input.domain) {
      const existingDomain = await schoolsRepository.findByDomain(input.domain);
      if (existingDomain) {
        throw new AppError('Domain already in use', 409);
      }
    }

    const defaultStart = new Date();
    const defaultEnd = new Date();
    defaultEnd.setFullYear(defaultEnd.getFullYear() + 1);

    const school = await schoolsRepository.createSchool({
      name: input.name,
      code: input.code.toUpperCase(),
      email: input.email,
      phone: input.phone,
      address: input.address,
      subscription: input.subscription ?? {
        plan: 'trial',
        status: 'active',
        startDate: defaultStart,
        endDate: defaultEnd,
      },
      branding: input.branding ?? {},
      domain: input.domain?.toLowerCase(),
      settings: input.settings ?? {},
      status: input.status,
      schoolId: null,
      createdBy: new Types.ObjectId(createdBy),
      updatedBy: new Types.ObjectId(createdBy),
    });

    return toSchoolResponse(school);
  }

  async listSchools(query: ListSchoolsQuery): Promise<PaginatedResult<SchoolResponse>> {
    const result = await schoolsRepository.listSchools(query, query.status);
    return {
      data: result.data.map(toSchoolResponse),
      pagination: result.pagination,
    };
  }

  async getSchoolById(req: Request, id: string): Promise<SchoolResponse> {
    assertSchoolAccess(req, id);

    const school = await schoolsRepository.getSchool(id);
    if (!school) {
      throw new AppError('School not found', 404);
    }

    return toSchoolResponse(school);
  }

  async updateSchool(req: Request, id: string, input: UpdateSchoolInput): Promise<SchoolResponse> {
    assertSchoolAccess(req, id);

    const school = await schoolsRepository.getSchool(id);
    if (!school) {
      throw new AppError('School not found', 404);
    }

    if (input.code && input.code.toUpperCase() !== school.code) {
      const existingCode = await schoolsRepository.findByCode(input.code);
      if (existingCode) {
        throw new AppError('School code already exists', 409);
      }
    }

    if (input.domain && input.domain.toLowerCase() !== school.domain) {
      const existingDomain = await schoolsRepository.findByDomain(input.domain);
      if (existingDomain) {
        throw new AppError('Domain already in use', 409);
      }
    }

    const updateData: Record<string, unknown> = { ...input };
    if (input.code) updateData.code = input.code.toUpperCase();
    if (input.domain) updateData.domain = input.domain.toLowerCase();

    const updated = await schoolsRepository.updateSchool(
      id,
      updateData as Partial<ISchool>,
      req.user!.id
    );
    if (!updated) {
      throw new AppError('School not found', 404);
    }

    return toSchoolResponse(updated);
  }

  async deleteSchool(id: string, deletedBy: string): Promise<void> {
    const school = await schoolsRepository.getSchool(id);
    if (!school) {
      throw new AppError('School not found', 404);
    }

    await schoolsRepository.deleteSchool(id, deletedBy);
  }

  async updateSubscription(
    id: string,
    input: UpdateSubscriptionInput,
    updatedBy: string
  ): Promise<SchoolResponse> {
    const school = await schoolsRepository.getSchool(id);
    if (!school) {
      throw new AppError('School not found', 404);
    }

    const updated = await schoolsRepository.updateSubscription(id, input, updatedBy);
    if (!updated) {
      throw new AppError('School not found', 404);
    }

    return toSchoolResponse(updated);
  }

  async updateBranding(
    req: Request,
    id: string,
    input: UpdateBrandingInput
  ): Promise<SchoolResponse> {
    assertSchoolAccess(req, id);

    const updated = await schoolsRepository.mergeBranding(id, input, req.user!.id);
    if (!updated) {
      throw new AppError('School not found', 404);
    }

    return toSchoolResponse(updated);
  }

  async updateSettings(
    req: Request,
    id: string,
    input: UpdateSettingsInput
  ): Promise<SchoolResponse> {
    assertSchoolAccess(req, id);

    const updated = await schoolsRepository.mergeSettings(id, input, req.user!.id);
    if (!updated) {
      throw new AppError('School not found', 404);
    }

    return toSchoolResponse(updated);
  }

  async getProfile(req: Request): Promise<SchoolResponse> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      throw new AppError('School context required', 400);
    }

    const school = await schoolsRepository.getSchool(schoolId);
    if (!school) {
      throw new AppError('School not found', 404);
    }

    return toSchoolResponse(school);
  }

  async updateProfile(req: Request, input: UpdateSchoolInput): Promise<SchoolResponse> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      throw new AppError('School context required', 400);
    }

    return this.updateSchool(req, schoolId, input);
  }
}

export const schoolsService = new SchoolsService();
