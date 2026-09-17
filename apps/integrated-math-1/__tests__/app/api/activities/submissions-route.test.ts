import { beforeEach, describe, expect, it, vi } from 'vitest';

const { auth, mutate } = vi.hoisted(() => ({ auth: vi.fn(), mutate: vi.fn() }));
vi.mock('@/lib/auth/server', () => ({ requireRequestSessionClaims: auth }));
vi.mock('@/lib/convex/server', () => ({ fetchInternalMutation: mutate, internal: { activities: { submitTranslationPilot: 'submit' } } }));

import { POST } from '@/app/api/activities/[activityId]/submissions/route';

const request = (body: unknown, key = 'attempt-1') => new Request('http://local/api/activities/a/submissions', { method: 'POST', headers: { cookie: 'session=x', 'content-type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(body) });

describe('IM1 translation pilot submission route', () => {
  beforeEach(() => { vi.clearAllMocks(); auth.mockResolvedValue({ sub: 'student-1', role: 'student' }); mutate.mockResolvedValue({ kind: 'graded', submissionId: 'submission-1', score: 1, maxScore: 1, evidencePersisted: false }); });

  it('passes only the authenticated learner and raw response to the durable mutation', async () => {
    const response = await POST(request({ rawResponse: '5 + 8', hintsUsed: 1, revealStepsSeen: 0 }), { params: Promise.resolve({ activityId: 'activity-1' }) });
    expect(response.status).toBe(200);
    expect(mutate).toHaveBeenCalledWith('submit', { userId: 'student-1', activityId: 'activity-1', idempotencyKey: 'attempt-1', rawResponse: '5 + 8', hintsUsed: 1, revealStepsSeen: 0 });
  });

  it('rejects client-owned grade and identity fields', async () => {
    const response = await POST(request({ rawResponse: '5 + 8', hintsUsed: 0, revealStepsSeen: 0, score: 1, nodeId: 'forged' }), { params: Promise.resolve({ activityId: 'activity-1' }) });
    expect(response.status).toBe(400);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('returns conflict for a changed retry', async () => {
    mutate.mockRejectedValue(new Error('idempotency_conflict'));
    const response = await POST(request({ rawResponse: '8 + 5', hintsUsed: 0, revealStepsSeen: 0 }), { params: Promise.resolve({ activityId: 'activity-1' }) });
    expect(response.status).toBe(409);
  });
});
