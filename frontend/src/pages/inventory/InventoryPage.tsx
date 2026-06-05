import { ModuleListPage } from '@/features/ModuleListPage';

export function InventoryPage() {
  return (
    <ModuleListPage
      title="Inventory"
      description="Manage assets, stock, vendors, and purchases"
      endpoint="/inventory/assets"
      fields={[
        { key: 'name', label: 'Asset Name', required: true },
        { key: 'category', label: 'Category', required: true },
        { key: 'serialNo', label: 'Serial No' },
        { key: 'location', label: 'Location' },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'active', label: 'Active' }, { value: 'maintenance', label: 'Maintenance' }, { value: 'retired', label: 'Retired' },
        ]},
      ]}
    />
  );
}
