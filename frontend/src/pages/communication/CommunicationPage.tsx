import { ModuleListPage } from '@/features/ModuleListPage';

export function CommunicationPage() {
  return (
    <ModuleListPage
      title="Announcements"
      description="Manage school announcements and notifications"
      endpoint="/communication/announcements"
      fields={[
        { key: 'title', label: 'Title', required: true },
        { key: 'content', label: 'Content', required: true },
        { key: 'priority', label: 'Priority', type: 'select', options: [
          { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' },
        ]},
      ]}
    />
  );
}
