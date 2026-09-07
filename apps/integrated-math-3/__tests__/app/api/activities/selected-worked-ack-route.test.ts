import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), mutate: vi.fn() }));
vi.mock('@/lib/auth/server', () => ({ requireStudentRequestClaims: mocks.auth }));
vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mocks.mutate,
  internal: { activities: { createServerOwnedSubmission: 'create-selected' } },
}));

import { POST } from '@/app/api/activities/submissions/route';

function request(body: unknown, key = 'worked-1') {
  return new Request('http://localhost/api/activities/submissions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify(body),
  });
}

const body = {
  contractVersion: 'practice.v1', activityId: 'activities:worked', mode: 'worked_example',
  status: 'submitted', attemptNumber: 1, submittedAt: '2026-09-07T00:00:00.000Z', answers: {}, parts: [],
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.auth.mockResolvedValue({ sub: 'profiles:student', role: 'student' });
});

describe('selected IM3 Worked acknowledgement route', () => {
  it('forwards the empty acknowledgement and returns the durable result', async () => {
    mocks.mutate.mockResolvedValue({ submissionId: 'submission:1', acknowledged: true });
    const response = await POST(request(body));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ submissionId: 'submission:1', acknowledged: true });
    expect(mocks.mutate).toHaveBeenCalledWith('create-selected', {
      userId: 'profiles:student', activityId: 'activities:worked', submissionData: body, idempotencyKey: 'worked-1',
    });
  });

  it('rejects a non-empty acknowledgement before the mutation', async () => {
    const response = await POST(request({ ...body, answers: { forged: 1 } }));
    expect(response.status).toBe(400);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
});
