import { ModuleListPage } from '@/features/ModuleListPage';

export function ParentsPage() {
  return (
    <ModuleListPage
      title="Parents"
      description="Manage parent profiles and child associations"
      endpoint="/parents"
      fields={[
        { key: 'firstName', label: 'First Name', required: true },
        { key: 'lastName', label: 'Last Name', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone' },
        { key: 'occupation', label: 'Occupation' },
      ]}
    />
  );
}
