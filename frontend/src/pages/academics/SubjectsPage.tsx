import { ModuleListPage } from '@/features/ModuleListPage';
import { DropdownItem } from '../students/StudentsPage';
import { useEffect, useState } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { api } from '@/services/api';

export function SubjectsPage() {
  const { addToast } = useNotificationStore();
  const [codeValue, setCodeValue] = useState<string>('SUBJ001');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const sessionsResponse = await api.get<{ data: DropdownItem[] }>('/academics/subjects');

        const existingSubjects = sessionsResponse.data || [];
        const nextNumber = existingSubjects.length + 1;
        const paddedNumber = String(nextNumber).padStart(3, '0');
        setCodeValue(`SUBJ${paddedNumber}`);

      } catch (error) {
        addToast('error', 'Failed to fetch subject dropdown variants.');
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
      title="Subjects"
      description="Manage academic subjects"
      endpoint="/academics/subjects"
      fields={[
        { key: 'name', label: 'Subject Name', required: true, colSpan: 1 },
        {
          key: 'code',
          label: 'Code',
          required: true,
          defaultValue: codeValue,
          disabled: true,
          colSpan: 1
        },
        {
          key: 'type',
          label: 'Type',
          type: 'select',
          options: [
            { value: 'core', label: 'Core' },
            { value: 'elective', label: 'Elective' },
          ],
          colSpan: 1
        },
      ]}
    />
  );
}