'use client';

import { useRouter } from 'next/navigation';

import { FormEvent, useState } from 'react';

type Field = {
  name: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'select' | 'hidden';
  defaultValue?: string;
  options?: Array<{ value: string; label: string }>;
};

export function AdminChangeForm({
  endpoint,
  method = 'POST',
  title,
  fields,
  submitLabel,
}: {
  endpoint: string;
  method?: 'POST' | 'PATCH';
  title: string;
  fields: Field[];
  submitLabel: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError(null);
    setStatus(null);
    setTargetId(null);
    setTemporaryPassword(null);
    try {
      const data: Record<string, FormDataEntryValue | string> = Object.fromEntries(
        new FormData(form).entries(),
      );
      if (data.kind === 'account.deactivate'
        && !window.confirm('Deactivate this account? The person will lose access.')) {
        setBusy(false);
        return;
      }
      if (data.kind === 'account.reset_password'
        && !window.confirm('Reset this password? Existing sessions will end. Give the new temporary password to the account owner.')) {
        setBusy(false);
        return;
      }
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({})) as { error?: string; targetId?: string; temporaryPassword?: string };
      if (!response.ok) setError(result.error ?? 'The change was not saved.');
      else {
        setTargetId(result.targetId ?? null);
        setTemporaryPassword(result.temporaryPassword ?? null);
        setStatus('Change saved.');
        form.reset();
      router.refresh();
      }
    } catch {
      setError('The change could not be saved. Try again.');
    }
    setBusy(false);
  }

  const formKey = `${title}-${fields.map((field) => field.name).join('-')}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return (
    <form className="form-stack" onSubmit={submit}>
      <h2>{title}</h2>
      {temporaryPassword ? <div role="status"><strong>Temporary password</strong><p>{temporaryPassword}</p><p>Give this password to the account owner. It will not appear again.</p></div> : null}
      {error ? <div className="error-summary" role="alert">{error}</div> : null}
      {status ? <div role="status"><p>{status}</p>{targetId ? <p>Target ID: <code>{targetId}</code></p> : null}</div> : null}
      {fields.map((field) => field.type === 'hidden' || (field.name === 'kind' && field.options?.length === 1) ? (
        <input key={field.name} type="hidden" name={field.name} value={field.defaultValue ?? field.options?.[0]?.value ?? ''} />
      ) : (
        <div className="field" key={field.name}>
          <label htmlFor={`${formKey}-${field.name}`}>{field.label}</label>
          {field.type === 'select' ? (
            <select id={`${formKey}-${field.name}`} name={field.name} required={field.required} defaultValue={field.defaultValue ?? field.options?.[0]?.value}>
              {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          ) : (
            <input id={`${formKey}-${field.name}`} name={field.name} type="text" defaultValue={field.defaultValue} required={field.required} />
          )}
        </div>
      ))}
      <button type="submit" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
    </form>
  );
}
