import { ModuleListPage } from '@/features/ModuleListPage';

export function PayrollPage() {
  return (
    <ModuleListPage
      title="Payroll"
      description="Manage salary structures and payslips"
      endpoint="/payroll"
      fields={[
        { key: 'month', label: 'Month', type: 'number' },
        { key: 'year', label: 'Year', type: 'number' },
        { key: 'netSalary', label: 'Net Salary', type: 'number' },
        { key: 'status', label: 'Status' },
      ]}
    />
  );
}
