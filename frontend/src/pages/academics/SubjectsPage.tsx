import { ModuleListPage } from '@/features/ModuleListPage';

export function SubjectsPage() {
  return (
    <ModuleListPage
      title="Subjects"
      description="Manage academic subjects"
      endpoint="/academics/subjects"
      fields={[
        { key: 'name', label: 'Subject Name', required: true },
        { key: 'code', label: 'Code', required: true },
        { key: 'type', label: 'Type', type: 'select', options: [
          { value: 'core', label: 'Core' }, { value: 'elective', label: 'Elective' },
        ]},
      ]}
    />
  );
}
