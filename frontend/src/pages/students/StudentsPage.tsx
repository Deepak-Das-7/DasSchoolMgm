import { ModuleListPage } from '@/features/ModuleListPage';

export function StudentsPage() {
  return (
    <ModuleListPage
      title="Students"
      description="Manage student records, admissions, and promotions"
      endpoint="/students"
      fields={[
        { key: 'admissionNo', label: 'Admission No', required: true },
        { key: 'firstName', label: 'First Name', required: true },
        { key: 'lastName', label: 'Last Name', required: true },
        { key: 'rollNo', label: 'Roll No' },
        { key: 'gender', label: 'Gender', type: 'select', options: [
          { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' },
        ]},
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'active', label: 'Active' }, { value: 'alumni', label: 'Alumni' },
        ]},
      ]}
    />
  );
}
