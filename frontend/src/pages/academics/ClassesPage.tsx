import { ModuleListPage } from '@/features/ModuleListPage';
import { DropdownItem, SelectOption } from '../students/StudentsPage';
import { useEffect, useState } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { api } from '@/services/api';

export function ClassesPage() {
  const { addToast } = useNotificationStore();
  const [sessionOptions, setSessionOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const sessionsResponse = await api.get<{ data: DropdownItem[] }>('/schools/academic-sessions');

        setSessionOptions(
          (sessionsResponse.data || []).map((s) => ({ value: s.id, label: s.name }))
        );
      } catch (error) {
        addToast('error', 'Failed to fetch session dropdown variants.');
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
      title="Classes"
      description="Manage academic classes"
      endpoint="/academics/classes"
      fields={[
        { key: 'name', label: 'Class Name', required: true, colSpan: 1 },
        { key: 'numericOrder', label: 'Order', type: 'number', colSpan: 1 },
        {
          key: 'sessionId',
          label: 'Session',
          type: 'select',
          required: true,
          options: sessionOptions,
          colSpan: 1
        },
      ]}
    />
  );
}