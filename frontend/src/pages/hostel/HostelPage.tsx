import { ModuleListPage } from '@/features/ModuleListPage';

export function HostelPage() {
  return (
    <ModuleListPage
      title="Hostel"
      description="Manage buildings, rooms, and student allocations"
      endpoint="/hostel/buildings"
      fields={[
        { key: 'name', label: 'Building Name', required: true },
        { key: 'type', label: 'Type', required: true },
        { key: 'floors', label: 'Floors', type: 'number', required: true },
      ]}
    />
  );
}
