import { ModuleListPage } from '@/features/ModuleListPage';

export function TimetablePage() {
  return (
    <ModuleListPage
      title="Timetable"
      description="Manage class timetables with conflict detection"
      endpoint="/timetable"
      fields={[
        { key: 'day', label: 'Day', type: 'select', options: [
          { value: 'monday', label: 'Monday' }, { value: 'tuesday', label: 'Tuesday' },
          { value: 'wednesday', label: 'Wednesday' }, { value: 'thursday', label: 'Thursday' },
          { value: 'friday', label: 'Friday' }, { value: 'saturday', label: 'Saturday' },
        ]},
      ]}
    />
  );
}
