import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/services/api';
import { useNotificationStore } from '@/stores/notificationStore';

export function AttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entityType, setEntityType] = useState('student');
  const [summary, setSummary] = useState<{ percentage: number; total: number; present: number } | null>(null);
  const { addToast } = useNotificationStore();

  const loadSummary = async () => {
    try {
      const data = await api.get<{ percentage: number; total: number; present: number }>('/attendance/report/summary', { date, entityType });
      setSummary(data);
    } catch (e) {
      addToast('error', e instanceof Error ? e.message : 'Failed to load summary');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-sm text-[var(--text-secondary)]">Mark and track attendance for students, teachers, and employees</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Attendance Summary</CardTitle></CardHeader>
        <div className="flex flex-wrap gap-4">
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Entity Type</label>
            <select className="input-field" value={entityType} onChange={(e) => setEntityType(e.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={loadSummary}>Load Summary</Button>
          </div>
        </div>
        {summary && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-[var(--bg-tertiary)] p-4 text-center">
              <p className="text-2xl font-bold">{summary.percentage}%</p>
              <p className="text-sm text-[var(--text-secondary)]">Attendance Rate</p>
            </div>
            <div className="rounded-lg bg-[var(--bg-tertiary)] p-4 text-center">
              <p className="text-2xl font-bold">{summary.present}</p>
              <p className="text-sm text-[var(--text-secondary)]">Present</p>
            </div>
            <div className="rounded-lg bg-[var(--bg-tertiary)] p-4 text-center">
              <p className="text-2xl font-bold">{summary.total}</p>
              <p className="text-sm text-[var(--text-secondary)]">Total Records</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
