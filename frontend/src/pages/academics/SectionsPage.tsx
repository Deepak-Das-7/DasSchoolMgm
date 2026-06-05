import { ModuleListPage } from '@/features/ModuleListPage';

export function SectionsPage() {
  return (
    <ModuleListPage
      title="Sections"
      description="Manage class sections"
      endpoint="/academics/sections"
      fields={[
        { key: 'name', label: 'Section Name', required: true },
        { key: 'capacity', label: 'Capacity', type: 'number' },
      ]}
    />
  );
}
