import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotificationStore } from '@/stores/notificationStore';

export function SchoolProfilePage() {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', code: '' });
  const { addToast } = useNotificationStore();

  useEffect(() => {
    api.get<typeof profile>('/schools/profile').then(setProfile).catch(() => {});
  }, []);

  const save = async () => {
    try {
      await api.put('/schools/profile', profile);
      addToast('success', 'School profile updated');
    } catch (e) {
      addToast('error', e instanceof Error ? e.message : 'Save failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">School Profile</h1>
        <p className="text-sm text-[var(--text-secondary)]">Manage your school information</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="School Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <Input label="School Code" value={profile.code} onChange={(e) => setProfile({ ...profile, code: e.target.value })} />
          <Input label="Email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
        </div>
        <Button className="mt-4" onClick={save}>Save Profile</Button>
      </Card>
    </div>
  );
}
