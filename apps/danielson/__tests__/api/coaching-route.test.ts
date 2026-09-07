import { beforeEach, expect, it, vi } from 'vitest';
import { POST } from '../../app/api/coaching/route';
import { requireDanielsonApiSession } from '../../lib/auth/server';
import { fetchInternalMutation } from '../../lib/convex/server';
vi.mock('../../lib/auth/server', () => ({ requireDanielsonApiSession: vi.fn() }));
vi.mock('../../lib/convex/server', () => ({ internal: { coaching: { createCycle: 'create', updateCycle: 'update' } }, fetchInternalMutation: vi.fn() }));
beforeEach(() => vi.clearAllMocks());
it('uses the session actor and drops client actor and organization fields', async () => {
  vi.mocked(requireDanielsonApiSession).mockResolvedValue({ sub: 'real' } as never);
  vi.mocked(fetchInternalMutation).mockResolvedValue({ kind: 'saved', cycleId: 'cycle' });
  const result = await POST(new Request('http://localhost/api/coaching', { method: 'POST', body: JSON.stringify({ kind: 'create', actorAccountId: 'spoofed', organizationId: 'other', teacherProfileId: 'teacher', skillId: 'skill' }) }));
  expect(result.status).toBe(200);
  expect(vi.mocked(fetchInternalMutation).mock.calls[0][1]).toEqual({ actorAccountId: 'real', teacherProfileId: 'teacher', skillId: 'skill' });
});
it('does not call a mutation without a session', async () => {
  vi.mocked(requireDanielsonApiSession).mockResolvedValue(new Response(null, { status: 401 }));
  expect((await POST(new Request('http://localhost/api/coaching', { method: 'POST' }))).status).toBe(401);
  expect(fetchInternalMutation).not.toHaveBeenCalled();
});

it.each([['denied', 403], ['conflict', 409], ['invalid', 400]])('returns a stable response for %s', async (kind, status) => {
  vi.mocked(requireDanielsonApiSession).mockResolvedValue({ sub: 'real' } as never);
  vi.mocked(fetchInternalMutation).mockResolvedValue({ kind });
  const result = await POST(new Request('http://localhost/api/coaching', { method: 'POST', body: JSON.stringify({ kind: 'reflect', cycleId: 'cycle', expectedRevision: 0, reflection: 'Reflection' }) }));
  expect(result.status).toBe(status);
});
it('rejects malformed data and hides backend exceptions', async () => {
  vi.mocked(requireDanielsonApiSession).mockResolvedValue({ sub: 'real' } as never);
  expect((await POST(new Request('http://localhost/api/coaching', { method: 'POST', body: '[]' }))).status).toBe(400);
  vi.mocked(fetchInternalMutation).mockRejectedValue(new Error('Private backend details'));
  const result = await POST(new Request('http://localhost/api/coaching', { method: 'POST', body: JSON.stringify({ kind: 'reflect' }) }));
  expect(result.status).toBe(400); expect(await result.text()).not.toContain('Private backend details');
});
