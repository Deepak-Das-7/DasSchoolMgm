import { ModuleListPage } from '@/features/ModuleListPage';

export function FeesPage() {
  return (
    <ModuleListPage
      title="Fee Management"
      description="Manage fee structures, payments, and receipts"
      endpoint="/fees/structures"
      fields={[
        { key: 'name', label: 'Structure Name', required: true },
        { key: 'totalAmount', label: 'Total Amount', type: 'number', required: true },
        { key: 'dueDate', label: 'Due Date', type: 'date' },
      ]}
    />
  );
}
