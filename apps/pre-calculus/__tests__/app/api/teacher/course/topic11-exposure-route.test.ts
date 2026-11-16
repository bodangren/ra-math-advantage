import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ claims: vi.fn(), mutate: vi.fn() }));
vi.mock('@/lib/auth/server', () => ({ requireTeacherRequestClaims: mocks.claims }));
vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mocks.mutate,
  internal: { learningEvidence: { submitTopic11TeacherSubmission: 'topic11TeacherSubmission' }, course: {} },
}));

import { POST } from '@/app/api/teacher/course/route';

function request(body: unknown) {
  return new Request('http://local.test/api/teacher/course', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
}

describe('Topic 1.1 teacher exposure route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.claims.mockResolvedValue({ sub: 'teacher' });
    mocks.mutate.mockResolvedValue({ persisted: true, masteryApplied: false, kstApplied: false, delivery: 'new', decision: { idempotency: 'new', exposureState: 'introduced', eligible: false, reason: 'teacher_led', masteryBearing: false } });
  });

  it('uses the session teacher and passes only stored identity fields', async () => {
    const response = await POST(request({
      action: 'recordTopic11Exposure', classId: 'class', studentId: 'student', submissionId: 'submission',
    }));
    expect(response.status).toBe(200);
    expect(mocks.mutate).toHaveBeenCalledWith('topic11TeacherSubmission', {
      teacherId: 'teacher', learnerId: 'student', classId: 'class', submissionId: 'submission',
    });
    expect(await response.json()).toEqual({ delivery: 'new' });
  });

  it('rejects every unknown client trust field before the mutation', async () => {
    const response = await POST(request({
      action: 'recordTopic11Exposure', classId: 'class', studentId: 'student', submissionId: 'submission', trusted: true,
    }));
    expect(response.status).toBe(400);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it('does not expose a server authorization reason', async () => {
    mocks.mutate.mockResolvedValueOnce({ accepted: false, reason: 'submission_not_found' });
    const response = await POST(request({
      action: 'recordTopic11Exposure', classId: 'class', studentId: 'student', submissionId: 'submission',
    }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Could not complete this action. Check the selected class, student, and lesson.' });
  });

  it.each([
    {},
    { persisted: true, masteryApplied: true, kstApplied: false, delivery: 'new', decision: { idempotency: 'new', exposureState: 'introduced', eligible: false, reason: 'teacher_led', masteryBearing: false } },
    { persisted: true, masteryApplied: false, kstApplied: false, delivery: 'new', decision: { idempotency: 'new', exposureState: 'introduced', eligible: false, reason: 'teacher_led', masteryBearing: false }, privateReason: 'do not expose' },
    { persisted: true, masteryApplied: false, kstApplied: false, delivery: 'new', decision: { idempotency: 'conflict', exposureState: 'introduced', eligible: false, reason: 'teacher_led', masteryBearing: false } },
    { persisted: false, masteryApplied: false, kstApplied: false, delivery: 'new', decision: { idempotency: 'new', exposureState: 'introduced', eligible: false, reason: 'teacher_led', masteryBearing: false } },
    { persisted: true, masteryApplied: false, kstApplied: false, delivery: 'new', decision: { idempotency: 'new', exposureState: 'awaiting_teacher_exposure', eligible: false, reason: 'node_not_enabled', masteryBearing: false } },
  ])('rejects a malformed teacher result without exposing it', async result => {
    mocks.mutate.mockResolvedValueOnce(result);
    const response = await POST(request({ action: 'recordTopic11Exposure', classId: 'class', studentId: 'student', submissionId: 'submission' }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Could not complete this action. Check the selected class, student, and lesson.' });
  });

  it('returns the exact replay receipt', async () => {
    mocks.mutate.mockResolvedValueOnce({ persisted: false, masteryApplied: false, kstApplied: false, delivery: 'replay', decision: { idempotency: 'replay', exposureState: 'introduced', eligible: false, reason: 'teacher_led', masteryBearing: false } });
    const response = await POST(request({ action: 'recordTopic11Exposure', classId: 'class', studentId: 'student', submissionId: 'submission' }));
    expect(await response.json()).toEqual({ delivery: 'replay' });
  });
});
