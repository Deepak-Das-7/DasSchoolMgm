import { Types } from 'mongoose';

export interface BaseDocument {
  _id: Types.ObjectId;
  schoolId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  isDeleted: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  schoolId: string | null;
  permissions: string[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}
