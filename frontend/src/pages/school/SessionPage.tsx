import { ModuleListPage } from '@/features/ModuleListPage';

export function SchoolSessionPage() {
  return (
    <ModuleListPage
      title="Sessions"
      description="Manage sessions records"
      endpoint="/schools/academic-sessions"
      fields={[
        { key: 'name', label: 'Session Name', required: true, placeholder: 'e.g. 2024-2025', table: true, colSpan: 2 },
        {
          key: 'status', label: 'Status', type: 'select', options: [
            { value: 'active', label: 'Active' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'completed', label: 'Completed' },
          ], required: true,
          placeholder: 'Select session status',
          table: true,
        },
        { key: 'startDate', label: 'Start Date', type: 'date', required: true, table: true, colSpan: 1 },
        { key: 'endDate', label: 'End Date', type: 'date', required: true, table: true, colSpan: 1 },
        { key: 'isCurrent', label: 'Is Current', type: 'boolean', required: true, table: true, colSpan: 1 },
      ]}
    />
  );
}
