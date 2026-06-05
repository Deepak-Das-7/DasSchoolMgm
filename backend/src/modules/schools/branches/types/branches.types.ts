import { BranchStatus } from '../../../../database/models';
import { Address } from '../../../../shared/types/common';

export interface BranchResponse {
  id: string;
  name: string;
  code: string;
  address: Address;
  phone?: string;
  email?: string;
  isMain: boolean;
  status: BranchStatus;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}
