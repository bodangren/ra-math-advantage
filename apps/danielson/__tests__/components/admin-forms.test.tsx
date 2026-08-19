import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AccountCreateForm } from '../../components/account-create-form';
import { AdminChangeForm } from '../../components/admin-change-form';

const randomUUID = vi.fn();

function response(ok: boolean, body: Record<string, unknown>) {
  return { ok, json: async () => body };
}

describe('administrator forms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    randomUUID.mockReset();
    randomUUID.mockReturnValueOnce('request-1').mockReturnValue('request-2');
    vi.stubGlobal('crypto', { randomUUID });
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('reuses a request ID after failure and rotates it only after success', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(response(false, { error: 'Try again' }) as Response)
      .mockResolvedValueOnce(response(true, { targetId: 'accounts:teacher' }) as Response)
      .mockResolvedValueOnce(response(true, { targetId: 'accounts:teacher' }) as Response);
    render(<AdminChangeForm
      endpoint="/api/admin/accounts"
      title="Change account status"
      submitLabel="Save status"
      fields={[{
        name: 'kind', label: 'Action', type: 'select', required: true,
        options: [{ value: 'account.activate', label: 'Activate' }],
      }]}
    />);

    fireEvent.submit(screen.getByRole('button', { name: 'Save status' }));
    await screen.findByRole('alert');
    fireEvent.submit(screen.getByRole('button', { name: 'Save status' }));
    await screen.findByText('Change saved.');
    fireEvent.submit(screen.getByRole('button', { name: 'Save status' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    const requestIds = fetchMock.mock.calls.map(([, init]) => (
      JSON.parse(String(init?.body)) as { requestId: string }
    ).requestId);
    expect(requestIds).toEqual(['request-1', 'request-1', 'request-2']);
  });

  it('requires confirmation before account deactivation', async () => {
    vi.mocked(confirm).mockReturnValue(false);
    render(<AdminChangeForm
      endpoint="/api/admin/accounts"
      title="Change account status"
      submitLabel="Save status"
      fields={[{
        name: 'kind', label: 'Action', type: 'select', required: true,
        options: [{ value: 'account.deactivate', label: 'Deactivate' }],
      }]}
    />);

    fireEvent.submit(screen.getByRole('button', { name: 'Save status' }));

    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
    expect(fetch).not.toHaveBeenCalled();
  });

  it('sends a stable request ID when it creates an account', async () => {
    vi.mocked(fetch).mockResolvedValue(response(true, {
      temporaryPassword: 'temporary-password',
      targetId: 'accounts:teacher',
    }) as Response);
    render(<AccountCreateForm />);
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'teacher.one' } });
    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'Teacher One' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Create account' }));

    await screen.findByText('temporary-password');
    const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body)) as { requestId: string };
    expect(body.requestId).toBe('request-1');
  });
});
