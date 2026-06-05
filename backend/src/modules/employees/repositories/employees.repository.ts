import { BaseRepository } from '../../../shared/repositories/base.repository';
import { Employee, IEmployee } from '../../../database/models/employee.model';

export class EmployeeRepository extends BaseRepository<IEmployee> {
  constructor() {
    super(Employee);
  }

  async findByEmployeeId(employeeId: string, schoolId: string): Promise<IEmployee | null> {
    return this.model.findOne(
      this.baseFilter(schoolId, { employeeId } as Record<string, unknown>)
    );
  }

  async findByEmail(email: string, schoolId: string): Promise<IEmployee | null> {
    return this.model.findOne(
      this.baseFilter(schoolId, { email: email.toLowerCase() } as Record<string, unknown>)
    );
  }
}
