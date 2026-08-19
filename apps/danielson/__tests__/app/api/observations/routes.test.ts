import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockReadObservationRequest = vi.hoisted(() => vi.fn());
const mockFetchInternalMutation = vi.hoisted(() => vi.fn());
const functionRefs = {
  createObservationDraft: Symbol('create'),
  saveObservationDraft: Symbol('save'),
  discardObservationDraft: Symbol('discard'),
  submitObservation: Symbol('submit'),
  amendObservation: Symbol('amend'),
};

vi.mock('@/lib/observations/observation-route', () => ({
  readObservationRequest: mockReadObservationRequest,
}));

vi.mock('@/lib/convex/server', () => ({
  internal: { observations: functionRefs },
  fetchInternalMutation: mockFetchInternalMutation,
}));

const createRoute = await import('../../../../app/api/observations/route');
const draftRoute = await import('../../../../app/api/observations/drafts/[recordId]/route');
const submitRoute = await import('../../../../app/api/observations/drafts/[recordId]/submit/route');
const amendRoute = await import('../../../../app/api/observations/records/[recordId]/amend/route');

function request(method = 'POST') {
  return new Request('http://localhost/api/observations', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
}

describe('observation API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(1_789_459_202_000);
    mockReadObservationRequest.mockResolvedValue({
      claims: { sub: 'accounts:observer' },
      command: {},
    });
    mockFetchInternalMutation.mockResolvedValue({ kind: 'saved' });
  });

  it('creates a draft with server-owned identity, source versions, and time', async () => {
    mockReadObservationRequest.mockResolvedValue({
      claims: { sub: 'accounts:observer' },
      command: {
        teacherProfileId: 'teacher_profiles:one',
        observationType: 'walkthrough',
        schoolYear: '2026-2027',
        observedAt: '2026-09-15T07:45:00.000Z',
      },
    });
    mockFetchInternalMutation.mockResolvedValue({ kind: 'created', draft: { draftId: 'observation_records:one' } });

    const response = await createRoute.POST(request());

    expect(response.status).toBe(200);
    expect(mockFetchInternalMutation).toHaveBeenCalledWith(functionRefs.createObservationDraft, {
      actorAccountId: 'accounts:observer',
      teacherProfileId: 'teacher_profiles:one',
      observationType: 'walkthrough',
      schoolYear: '2026-2027',
      observedAt: '2026-09-15T07:45:00.000Z',
      componentIds: undefined,
      sourceVersion: 'danielson-observation.v1',
      frameworkVersion: 'danielson-2022',
      now: 1_789_459_202_000,
    });
  });

  it('uses the route record ID for save and discard', async () => {
    mockReadObservationRequest.mockResolvedValue({
      claims: { sub: 'accounts:observer' },
      command: { draftId: 'observation_records:attacker', expectedRevision: 4, items: [], confirmed: true },
    });
    const context = { params: Promise.resolve({ recordId: 'observation_records:actual' }) };

    await draftRoute.PATCH(request('PATCH'), context);
    await draftRoute.DELETE(request('DELETE'), context);

    expect(mockFetchInternalMutation).toHaveBeenNthCalledWith(1, functionRefs.saveObservationDraft, expect.objectContaining({
      actorAccountId: 'accounts:observer',
      draftId: 'observation_records:actual',
      expectedRevision: 4,
    }));
    expect(mockFetchInternalMutation).toHaveBeenNthCalledWith(2, functionRefs.discardObservationDraft, {
      actorAccountId: 'accounts:observer',
      draftId: 'observation_records:actual',
      expectedRevision: 4,
      confirmed: true,
    });
  });

  it('passes the current revision and idempotency keys to submit and amend', async () => {
    mockReadObservationRequest.mockResolvedValueOnce({
      claims: { sub: 'accounts:observer' },
      command: { expectedRevision: 5, submissionKey: 'submit-key' },
    }).mockResolvedValueOnce({
      claims: { sub: 'accounts:observer' },
      command: { expectedVersion: 2, idempotencyKey: 'amend-key', reason: 'Correction', changedItems: [] },
    });
    const context = { params: Promise.resolve({ recordId: 'observation_records:actual' }) };

    await submitRoute.POST(request(), context);
    await amendRoute.POST(request(), context);

    expect(mockFetchInternalMutation).toHaveBeenNthCalledWith(1, functionRefs.submitObservation, expect.objectContaining({
      actorAccountId: 'accounts:observer',
      draftId: 'observation_records:actual',
      expectedRevision: 5,
      submissionKey: 'submit-key',
    }));
    expect(mockFetchInternalMutation).toHaveBeenNthCalledWith(2, functionRefs.amendObservation, expect.objectContaining({
      actorAccountId: 'accounts:observer',
      observationId: 'observation_records:actual',
      expectedVersion: 2,
      idempotencyKey: 'amend-key',
    }));
  });
});
