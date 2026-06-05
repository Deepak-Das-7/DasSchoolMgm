import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotificationStore } from '@/stores/notificationStore';
import { ArrowLeft } from 'lucide-react';

const schema = z.object({ email: z.string().email() });

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { addToast } = useNotificationStore();
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: { email: string }) => {
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
      addToast('success', 'Reset link sent to your email');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'Failed to send reset link');
    }
  };

  return (
    <div>
      <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>
      <h2 className="mb-2 text-2xl font-bold">Forgot password</h2>
      <p className="mb-8 text-sm text-[var(--text-secondary)]">
        {sent ? 'Check your email for reset instructions.' : 'Enter your email to receive a reset link.'}
      </p>
      {!sent && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" error={errors.email?.message as string} {...register('email')} />
          <Button type="submit" className="w-full">Send reset link</Button>
        </form>
      )}
    </div>
  );
}
