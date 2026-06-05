import { ModuleListPage } from '@/features/ModuleListPage';

export function EventsPage() {
  return (
    <ModuleListPage
      title="Events & Calendar"
      description="Manage school events and holidays"
      endpoint="/events/events"
      fields={[
        { key: 'title', label: 'Event Title', required: true },
        { key: 'description', label: 'Description' },
        { key: 'type', label: 'Type' },
        { key: 'startDate', label: 'Start Date', type: 'date', required: true },
        { key: 'endDate', label: 'End Date', type: 'date' },
        { key: 'location', label: 'Location' },
      ]}
    />
  );
}
