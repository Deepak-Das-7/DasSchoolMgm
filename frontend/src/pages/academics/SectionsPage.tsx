import { ModuleListPage } from '@/features/ModuleListPage';
import { DropdownItem, SelectOption } from '../students/StudentsPage';
import { useEffect, useState } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { api } from '@/services/api';
export function SectionsPage() {
  const { addToast } = useNotificationStore();
  const [classOptions, setClassOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const sessionsResponse = await api.get<{ data: DropdownItem[] }>('/academics/classes');
        console.log('Fetched classes:', sessionsResponse.data);
        setClassOptions(
          (sessionsResponse.data || []).map((s) => ({ value: s.id, label: s.name }))
        );
      } catch (error) {
        addToast('error', 'Failed to fetch class dropdown variants.');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [addToast]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Loading data configurations...
      </div>
    );
  }
  return (
    <ModuleListPage
      title="Sections"
      description="Manage class sections"
      endpoint="/academics/sections"
      fields={[
        { key: 'name', label: 'Section Name', required: true },
        { key: 'capacity', label: 'Capacity', type: 'number' },
        {
          key: 'classId',
          label: 'Class',
          type: 'select',
          required: true,
          options: classOptions
        }
      ]}
    />
  );
}
