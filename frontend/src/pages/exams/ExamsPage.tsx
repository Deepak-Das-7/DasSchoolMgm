import { ModuleListPage } from '@/features/ModuleListPage';

export function ExamsPage() {
  return (
    <ModuleListPage
      title="Examinations"
      description="Manage exams, marks entry, and report cards"
      endpoint="/exams"
      fields={[
        { key: 'name', label: 'Exam Name', required: true },
        { key: 'type', label: 'Type', required: true },
        { key: 'startDate', label: 'Start Date', type: 'date' },
        { key: 'endDate', label: 'End Date', type: 'date' },
        { key: 'maxMarks', label: 'Max Marks', type: 'number' },
        { key: 'passingMarks', label: 'Passing Marks', type: 'number' },
      ]}
    />
  );
}
