import { ModuleListPage } from '@/features/ModuleListPage';

export function EmployeesPage() {
  return (
    <ModuleListPage
      title="Employees"
      description="Manage non-teaching staff and HR records"
      endpoint="/employees"
      fields={[
        { key: 'employeeId', label: 'Employee ID', required: true },
        { key: 'firstName', label: 'First Name', required: true },
        { key: 'lastName', label: 'Last Name', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'designation', label: 'Designation' },
        { key: 'salary', label: 'Salary', type: 'number' },
      ]}
    />
  );
}
