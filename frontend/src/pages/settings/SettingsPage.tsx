import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotificationStore } from '@/stores/notificationStore';
import { ThemeToggle } from '@/components/ThemeToggle';

export function SettingsPage() {
  const [general, setGeneral] = useState({ timezone: '', currency: '', dateFormat: '', language: '' });
  const [branding, setBranding] = useState({ primaryColor: '', secondaryColor: '', tagline: '' });
  const [roles, setRoles] = useState<Array<{ role: string; label: string; permissions: string[] }>>([]);
  const { addToast } = useNotificationStore();

  useEffect(() => {
    Promise.all([
      api.get<typeof general>('/settings/general'),
      api.get<typeof branding>('/settings/branding'),
      api.get<typeof roles>('/settings/roles'),
    ]).then(([g, b, r]) => { setGeneral(g); setBranding(b); setRoles(r); }).catch(() => {});
  }, []);

  const saveGeneral = async () => {
    try {
      await api.put('/settings/general', general);
      addToast('success', 'General settings saved');
    } catch (e) { addToast('error', e instanceof Error ? e.message : 'Save failed'); }
  };

  const saveBranding = async () => {
    try {
      await api.put('/settings/branding', branding);
      addToast('success', 'Branding saved');
    } catch (e) { addToast('error', e instanceof Error ? e.message : 'Save failed'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)]">Configure your school preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
          <div className="space-y-4">
            <Input label="Timezone" value={general.timezone} onChange={(e) => setGeneral({ ...general, timezone: e.target.value })} />
            <Input label="Currency" value={general.currency} onChange={(e) => setGeneral({ ...general, currency: e.target.value })} />
            <Input label="Date Format" value={general.dateFormat} onChange={(e) => setGeneral({ ...general, dateFormat: e.target.value })} />
            <Input label="Language" value={general.language} onChange={(e) => setGeneral({ ...general, language: e.target.value })} />
            <Button onClick={saveGeneral}>Save General</Button>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
          <div className="space-y-4">
            <Input label="Primary Color" value={branding.primaryColor} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} />
            <Input label="Secondary Color" value={branding.secondaryColor} onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })} />
            <Input label="Tagline" value={branding.tagline} onChange={(e) => setBranding({ ...branding, tagline: e.target.value })} />
            <Button onClick={saveBranding}>Save Branding</Button>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--text-secondary)]">Theme</span>
            <ThemeToggle />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Roles & Permissions</CardTitle></CardHeader>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {roles.map((r) => (
              <div key={r.role} className="rounded-lg border border-[var(--border)] p-3">
                <p className="font-medium">{r.label}</p>
                <p className="text-xs text-[var(--text-secondary)]">{r.permissions.length} permissions</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
