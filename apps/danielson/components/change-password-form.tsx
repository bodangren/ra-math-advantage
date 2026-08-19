'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function ChangePasswordForm() {
  const router = useRouter();
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const payload = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) setError(payload.error ?? 'Unable to update password.');
    else { setSaved(true); router.push('/'); router.refresh(); }
    setBusy(false);
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      {error ? <div className="error-summary" role="alert">{error}</div> : null}
      {saved ? <p role="status">Password updated.</p> : null}
      {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
        <div className="field" key={field}>
          <label htmlFor={field}>{field === 'currentPassword' ? 'Current password' : field === 'newPassword' ? 'New password' : 'Confirm new password'}</label>
          <input id={field} name={field} type="password" autoComplete={field === 'currentPassword' ? 'current-password' : 'new-password'} value={values[field]} onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))} required />
        </div>
      ))}
      <button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button>
    </form>
  );
}
