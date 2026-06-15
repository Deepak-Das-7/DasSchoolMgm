import { ModuleListPage } from '@/features/ModuleListPage';

export function ClassesPage() {
  return (
    <ModuleListPage
      title="Classes"
      description="Manage academic classes"
      endpoint="/academics/classes"
      fields={[
        { key: 'name', label: 'Class Name', required: true },
        { key: 'numericOrder', label: 'Order', type: 'number' },
        { key: 'sessionId', label: 'Session ID', type: 'text' },
      ]}
    />
  );
}
