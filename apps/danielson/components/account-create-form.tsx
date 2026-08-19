'use client';

import { FormEvent, useRef, useState } from 'react';

export function AccountCreateForm() {
  const [error, setError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const requestId = useRef(crypto.randomUUID());

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError(null);
    setTemporaryPassword(null);
    setTargetId(null);
    try {
      const response = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...Object.fromEntries(new FormData(form).entries()),
          requestId: requestId.current,
        }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string; temporaryPassword?: string; targetId?: string };
      if (!response.ok) setError(payload.error ?? 'Unable to create account.');
      else {
        setTemporaryPassword(payload.temporaryPassword ?? null);
        setTargetId(payload.targetId ?? null);
        requestId.current = crypto.randomUUID();
        form.reset();
      }
    } catch {
      setError('The account could not be created. Try again.');
    }
    setBusy(false);
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      {error ? <div className="error-summary" role="alert">{error}</div> : null}
      {temporaryPassword || targetId ? <div className="card" role="status">
        {temporaryPassword ? <><strong>Temporary password</strong><p>{temporaryPassword}</p><p>Give this password to the account owner. It will not appear again.</p></> : null}
        {targetId ? <p>Account ID: <code>{targetId}</code></p> : null}
      </div> : null}
      <div className="field"><label htmlFor="username">Username</label><input id="username" name="username" required /></div>
      <div className="field"><label htmlFor="displayName">Display name</label><input id="displayName" name="displayName" required /></div>
      <div className="field"><label htmlFor="position">Position (optional)</label><input id="position" name="position" /></div>
      <div className="field"><label htmlFor="sharedSessionRole">Shared account category</label><select id="sharedSessionRole" name="sharedSessionRole" defaultValue="teacher"><option value="teacher">Teacher</option><option value="admin">Administrator</option></select></div>
      <button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
    </form>
  );
}
