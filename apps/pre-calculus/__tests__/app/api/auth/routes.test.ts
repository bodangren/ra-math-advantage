import { beforeEach, describe, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ query: vi.fn(), mutation: vi.fn(), verify: vi.fn(), hash: vi.fn() }));
vi.mock('@/lib/convex/server', () => ({ fetchInternalQuery: mock.query, fetchInternalMutation: mock.mutation,
  internal: { auth: { getCredentialByUsername: 'credential', registerStudent: 'register', checkAuthAttempt: 'limit' } } }));
vi.mock('@math-platform/core-auth', () => ({ verifyPassword: mock.verify, hashPassword: mock.hash,
  generatePasswordSalt: () => 'salt', PASSWORD_HASH_ITERATIONS: 120000, signSessionToken: async () => 'token',
  SESSION_COOKIE_NAME: 'session', getAuthJwtSecret: () => 'secret' }));
import { POST as login } from '@/app/api/auth/login/route';
import { POST as register } from '@/app/api/auth/register/route';
const request = (value: unknown) => new Request('http://localhost/api/auth', { method: 'POST', body: JSON.stringify(value) });
beforeEach(() => {
  vi.clearAllMocks();
  mock.mutation.mockImplementation(async ref => ref === 'limit' ? { allowed: true } : { ok: true });
  mock.query.mockResolvedValue({ profileId: 'p', username: 'student', role: 'student', organizationId: 'o', passwordHash: 'hash', passwordSalt: 'salt', passwordHashIterations: 120000 });
  mock.verify.mockResolvedValue(true); mock.hash.mockResolvedValue('hash');
});
describe('authentication routes', () => {
  it('passes the full password credential to verification', async () => {
    expect((await login(request({ username: 'student', password: 'password' }))).status).toBe(200);
    expect(mock.verify).toHaveBeenCalledWith('password', { salt: 'salt', iterations: 120000, passwordHash: 'hash' });
  });
  it.each([null, {}, { username: {}, password: 'password' }, { username: 'x', password: [] }, { username: 'x', password: 'a'.repeat(256) }])('rejects malformed input %j', async body => {
    expect((await login(request(body))).status).toBe(400);
    expect((await register(request(body))).status).toBe(400);
    expect(mock.mutation).not.toHaveBeenCalled();
  });
  it('reports an existing name without credential replacement', async () => {
    mock.mutation.mockImplementation(async ref => ref === 'limit' ? { allowed: true } : { ok: false, reason: 'username_taken' });
    expect((await register(request({ username: 'student', password: 'password' }))).status).toBe(409);
    expect(mock.mutation.mock.calls.map(call => call[0])).toEqual(['limit', 'register']);
  });
  it('stops expensive password work after the rate limit', async () => {
    mock.mutation.mockResolvedValue({ allowed: false, retryAfter: 60 });
    for (const handler of [login, register]) {
      const response = await handler(request({ username: 'student', password: 'password' }));
      expect(response.status).toBe(429); expect(response.headers.get('Retry-After')).toBe('60');
    }
    expect(mock.verify).not.toHaveBeenCalled(); expect(mock.hash).not.toHaveBeenCalled();
  });
});
