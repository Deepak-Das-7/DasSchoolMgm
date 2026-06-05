import { DepartmentStatus } from '../../../../database/models';

export interface DepartmentResponse {
  id: string;
  name: string;
  code: string;
  description?: string;
  headId?: string;
  status: DepartmentStatus;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}
