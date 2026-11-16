import { describe, expect, it, vi } from 'vitest';
import { createPrecalculusPilotRoute } from '@/app/api/learning-evidence/precalculus-pilot/route';

const result = {
  persisted: true, masteryApplied: true, kstApplied: false, delivery: 'new',
  decision: { idempotency: 'new', exposureState: 'introduced', eligible: true, reason: 'eligible', masteryBearing: true },
} as const;
function request(body: unknown) {
  return new Request('http://local/evidence', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
}
function harness() {
  const submitLearningEvidence = vi.fn(async () => result);
  const route = createPrecalculusPilotRoute({
    getServerSession: async () => ({ user: { id: 'student', role: 'student' } }),
    submitLearningEvidence,
  });
  return { route, submitLearningEvidence };
}
describe('AP Precalculus learning-evidence route', () => {
  it('submits only the authenticated learner and opaque submission ID', async () => {
    const h = harness();
    const response = await h.route.POST(request({ submissionId: 'activity_submissions:1' }));
    expect(response.status).toBe(200);
    expect(h.submitLearningEvidence).toHaveBeenCalledWith({ learnerId: 'student', submissionId: 'activity_submissions:1' });
  });
  it('rejects client evidence and learner identity', async () => {
    const h = harness();
    const response = await h.route.POST(request({ submissionId: 'activity_submissions:1', learnerId: 'other', evidence: {} }));
    expect(response.status).toBe(400);
    expect(h.submitLearningEvidence).not.toHaveBeenCalled();
  });
  it('rejects a teacher session', async () => {
    const submitLearningEvidence = vi.fn();
    const route = createPrecalculusPilotRoute({ getServerSession: async () => ({ user: { id: 'teacher', role: 'teacher' } }), submitLearningEvidence });
    expect((await route.POST(request({ submissionId: 'activity_submissions:1' }))).status).toBe(403);
    expect(submitLearningEvidence).not.toHaveBeenCalled();
  });
  it('does not return private server fields', async () => {
    const h = harness();
    h.submitLearningEvidence.mockResolvedValueOnce(
      { ...result, privateAnswer: 'hidden' } as unknown as typeof result,
    );
    const body = await (await h.route.POST(request({ submissionId: 'activity_submissions:1' }))).json();
    expect(body).toEqual(result);
  });
});
