import { ModuleListPage } from '@/features/ModuleListPage';

export function TeachersPage() {
  return (
    <ModuleListPage
      title="Teachers"
      description="Manage teacher profiles, qualifications, and assignments"
      endpoint="/teachers"
      fields={[
        { key: 'employeeId', label: 'Employee ID', required: true },
        { key: 'firstName', label: 'First Name', required: true },
        { key: 'lastName', label: 'Last Name', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone' },
        { key: 'salary', label: 'Salary', type: 'number' },
      ]}
    />
  );
}
