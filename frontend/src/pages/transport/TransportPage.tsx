import { ModuleListPage } from '@/features/ModuleListPage';

export function TransportPage() {
  return (
    <ModuleListPage
      title="Transport"
      description="Manage vehicles, routes, and GPS tracking"
      endpoint="/transport/vehicles"
      fields={[
        { key: 'registrationNo', label: 'Registration No', required: true },
        { key: 'type', label: 'Type', required: true },
        { key: 'capacity', label: 'Capacity', type: 'number', required: true },
        { key: 'driverName', label: 'Driver Name', required: true },
        { key: 'driverPhone', label: 'Driver Phone', required: true },
        { key: 'gpsDeviceId', label: 'GPS Device ID' },
      ]}
    />
  );
}
