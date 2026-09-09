import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), query: vi.fn() }));
vi.mock('@/lib/auth/server', () => ({ requireStudentRequestClaims: mocks.auth }));
vi.mock('@/lib/convex/server', () => ({ internal: { activities: { checkQuadraticFormulaDiscriminant: 'check' } }, fetchInternalQuery: mocks.query }));
import { POST } from '@/app/api/activities/quadratic-formula/check/route';
const body = { activityId: 'activities:qf', pendingSubmissionId: 'activity_submissions:pending', fieldId: 'discriminant', rawAnswer: '16' };
const request = (value: unknown) => new Request('http://local/api/activities/quadratic-formula/check', { method: 'POST', body: JSON.stringify(value) });
beforeEach(() => { mocks.auth.mockReset().mockResolvedValue({ sub: 'profiles:student' }); mocks.query.mockReset().mockResolvedValue({ isCorrect: true }); });
describe('Guided discriminant check route', () => {
  it.each([true, false])('returns only the %s decision with no-store headers', async isCorrect => {
    mocks.query.mockResolvedValue({ isCorrect, privateAnswer: 'sentinel' });
    const response = await POST(request(body));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ isCorrect });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(mocks.query).toHaveBeenCalledWith('check', { ...body, userId: 'profiles:student' });
  });
  it.each([null, {}, { ...body, fieldId: 'x1' }, { ...body, rawAnswer: '1'.repeat(161) }, { ...body, rawAnswer: 16 }, { ...body, userId: 'profiles:other' }, { ...body, seed: 1 }, { ...body, activityId: '' }])('rejects malformed or untrusted fields', async value => {
    expect((await POST(request(value))).status).toBe(400); expect(mocks.query).not.toHaveBeenCalled();
  });
  it('returns the auth failure without querying', async () => {
    mocks.auth.mockResolvedValue(new Response(null, { status: 401 }));
    expect((await POST(request(body))).status).toBe(401); expect(mocks.query).not.toHaveBeenCalled();
  });
  it.each([null, { isCorrect: 'true' }])('rejects an invalid internal response', async value => {
    mocks.query.mockResolvedValue(value); expect((await POST(request(body))).status).toBe(503);
  });
  it('does not expose internal authority errors', async () => {
    mocks.query.mockRejectedValue(new Error('private seed sentinel'));
    const response = await POST(request(body)); expect(response.status).toBe(503); expect(await response.text()).not.toContain('sentinel');
  });
});
