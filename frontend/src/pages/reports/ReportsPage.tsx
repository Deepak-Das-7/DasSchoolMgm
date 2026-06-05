import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Download } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const reports = [
  { title: 'Academic Report', description: 'Student performance and grades', endpoint: '/reports/academic' },
  { title: 'Attendance Report', description: 'Attendance summary by entity', endpoint: '/reports/attendance' },
  { title: 'Financial Report', description: 'Fee collection and payments', endpoint: '/reports/financial' },
  { title: 'Payroll Report', description: 'Salary and payslip summary', endpoint: '/reports/payroll' },
];

export function ReportsPage() {
  const download = (endpoint: string, format: string) => {
    // 1. Get and parse the auth token safely
    const authStorage = localStorage.getItem('schoolerp-auth');
    let accessToken = '';

    try {
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        // Double check your state manager key! It might be parsed.state.token or parsed.state.user.token
        accessToken = parsed?.state?.accessToken || parsed?.state?.token || '';
      }
    } catch (error) {
      console.error('Failed to parse auth token from localStorage', error);
    }

    if (!accessToken) {
      console.error('No access token found. User might be logged out.');
      // Optional: Toast notice or redirect to login
      return;
    }

    // 2. Normalize URLs to prevent double slashes (e.g. /api/v1//reports)
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const downloadUrl = `${baseUrl}${cleanEndpoint}?format=${format}&token=${encodeURIComponent(accessToken)}`;

    // 3. Trigger the secure download in a new tab
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-[var(--text-secondary)]">Generate and export school reports</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.title}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary-600/10 p-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <CardTitle>{report.title}</CardTitle>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{report.description}</p>
                </div>
              </div>
            </CardHeader>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => download(report.endpoint, 'excel')}>
                <Download className="h-4 w-4" /> Excel
              </Button>
              <Button size="sm" variant="secondary" onClick={() => download(report.endpoint, 'csv')}>
                <Download className="h-4 w-4" /> CSV
              </Button>
              <Button size="sm" variant="secondary" onClick={() => download(report.endpoint, 'pdf')}>
                <Download className="h-4 w-4" /> PDF
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
