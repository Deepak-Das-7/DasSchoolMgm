import { useEffect, useState } from 'react';
import { ModuleListPage } from '@/features/ModuleListPage';
import { api } from '@/services/api';
import { useNotificationStore } from '@/stores/notificationStore';

export interface DropdownItem {
  _id: string;
  id: string;
  name: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export function StudentsPage() {
  const { addToast } = useNotificationStore();
  const [classOptions, setClassOptions] = useState<SelectOption[]>([]);
  const [sectionOptions, setSectionOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // 1. Change the generic to reflect that the API returns an object with a .data property
        const [classesResponse, sectionsResponse] = await Promise.all([
          api.get<{ data: DropdownItem[] }>('/academics/classes'),
          api.get<{ data: DropdownItem[] }>('/academics/sections/class-sections') // Assuming this endpoint returns sections grouped by class,
        ]);

        // 2. Safely map over the .data arrays
        setClassOptions(
          (classesResponse.data || []).map((c) => ({ value: c._id, label: c.name }))
        );
        setSectionOptions(
          (sectionsResponse.data || []).map((s) => ({ value: s._id, label: s.name }))
        );
      } catch (error) {
        addToast('error', 'Failed to fetch class or section dropdown variants.');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [addToast]);

  // Keep rendering clean and empty to avoid empty selection layouts while waiting for APIs
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Loading data configurations...
      </div>
    );
  }
  return (
    <ModuleListPage
      title="Students"
      description="Manage student records, admissions, and promotions"
      endpoint="/students"
      fields={[
        { key: 'admissionNo', label: 'Admission No', colSpan: 1 },
        { key: 'rollNo', label: 'Roll No', colSpan: 1 },
        { key: 'admissionDate', label: 'Admission Date', type: 'date', colSpan: 1 },

        { key: 'firstName', label: 'First Name', required: true, colSpan: 1 },
        { key: 'lastName', label: 'Last Name', required: true, colSpan: 1 },
        { key: 'dob', label: 'Date of Birth', type: 'date', required: true, colSpan: 1 },

        {
          key: 'gender',
          label: 'Gender',
          type: 'select',
          required: true,
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ],
          colSpan: 1,
        },
        {
          key: 'classId',
          label: 'Class',
          type: 'select',
          required: true,
          options: classOptions,
          colSpan: 1
        },
        {
          key: 'sectionId',
          label: 'Section',
          type: 'select',
          required: true,
          options: sectionOptions,
          colSpan: 1
        },
      ]}
    />
  );
}