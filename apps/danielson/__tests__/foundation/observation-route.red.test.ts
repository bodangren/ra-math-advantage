import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRequireDanielsonApiSession = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/server', () => ({
  requireDanielsonApiSession: mockRequireDanielsonApiSession,
}));

const { readObservationRequest } = await import('../../lib/observations/observation-route');

describe('observation request boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireDanielsonApiSession.mockResolvedValue({ sub: 'accounts:current-observer' });
  });

  it('uses the server session and removes client identity and scope fields', async () => {
    const result = await readObservationRequest(new Request('http://localhost/api/observations/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        draftId: 'observation_records:draft-1',
        expectedRevision: 3,
        submissionKey: 'submit-1',
        actorAccountId: 'accounts:attacker',
        organizationId: 'organizations:other',
        roles: ['slt'],
        accessScope: { allTeachers: true },
      }),
    }));

    expect(result).not.toBeInstanceOf(Response);
    expect(result).toEqual({
      claims: { sub: 'accounts:current-observer' },
      command: {
        draftId: 'observation_records:draft-1',
        expectedRevision: 3,
        submissionKey: 'submit-1',
      },
    });
    expect(mockRequireDanielsonApiSession).toHaveBeenCalledOnce();
  });

  it('returns the authentication response without reading a command', async () => {
    const unauthorized = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    mockRequireDanielsonApiSession.mockResolvedValue(unauthorized);

    const result = await readObservationRequest(new Request('http://localhost/api/observations/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId: 'observation_records:draft-1' }),
    }));

    expect(result).toBe(unauthorized);
  });
});
