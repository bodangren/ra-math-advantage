import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), mutate: vi.fn() }));
vi.mock('@/lib/auth/server', () => ({ requireRequestSessionClaims: mocks.auth }));
vi.mock('@/lib/convex/server', () => ({ fetchInternalMutation: mocks.mutate, internal: { activities: { recordTeacherTranslationExposure: 'record-exposure' } } }));
import { POST } from '@/app/api/teacher/translation-exposure/route';
const request = (body: unknown, key = 'retry-key') => new Request('http://localhost/api/teacher/translation-exposure', { method: 'POST', headers: { 'content-type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(body) });
beforeEach(() => { vi.resetAllMocks(); mocks.auth.mockResolvedValue({ sub: 'authenticated-teacher', role: 'teacher' }); });

describe('IM1 teacher instruction route', () => {
  it('uses the authenticated teacher and forwards the selected source plus retry key', async () => {
    mocks.mutate.mockResolvedValue({ evidenceId: 'evidence', replay: false });
    const response = await POST(request({ teacherId: 'forged-teacher', studentId: 'student', classId: 'class', submissionId: 'submission' }));
    expect(response.status).toBe(200);
    expect(mocks.mutate).toHaveBeenCalledWith('record-exposure', { teacherId: 'authenticated-teacher', studentId: 'student', classId: 'class', submissionId: 'submission', idempotencyKey: 'retry-key' });
  });
  it('rejects student sessions and incomplete requests without a mutation', async () => {
    mocks.auth.mockResolvedValueOnce({ sub: 'student', role: 'student' });
    expect((await POST(request({}))).status).toBe(403);
    expect((await POST(request({ studentId: 'student' }))).status).toBe(400);
    expect((await POST(request({ studentId: 'student', classId: 'class', submissionId: 'submission' }, ''))).status).toBe(400);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
  it('returns a replay conflict without exposing internal error details', async () => {
    mocks.mutate.mockRejectedValue(new Error('idempotency_conflict: private record details'));
    const response = await POST(request({ studentId: 'student', classId: 'class', submissionId: 'submission' }));
    expect(response.status).toBe(409);
    expect(await response.text()).not.toContain('private record');
  });
});
