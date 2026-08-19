'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, redirect: redirectTo }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string; redirect?: string };
      if (!response.ok) {
        setError(payload.error ?? 'Unable to sign in. Check your username and password.');
        return;
      }
      router.push(payload.redirect ?? '/');
      router.refresh();
    } catch {
      setError('Unable to sign in. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={submit} noValidate>
      {error ? <div className="error-summary" role="alert">{error}</div> : null}
      <div className="field">
        <label htmlFor="username">Username</label>
        <input id="username" name="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </div>
      <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}
