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

        setClassOptions(
          (sessionsResponse.data || []).map((s) => ({
            value: s._id, // 👈 CHANGED: Map to s._id to match your backend identifiers
            label: s.name
          }))
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
        {
          key: 'name',
          label: 'Section Name',
          type: 'select',
          required: true,
          options: ["A", "B", "C", "D"].map((name) => ({ value: name, label: name }))
        },
        {
          key: 'capacity',
          label: 'Capacity', // Fixed casing matching standard field patterns
          type: 'select',
          required: true,
          options: ["10", "20", "30", "40", "50", "55", "60", "65", "70"].map((num) => ({ value: num, label: num }))
        },
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