import { describe, expect, it } from 'vitest';

import { sanitizeAuditSnapshot } from '../../lib/foundation/audit';

describe('Danielson access audit snapshot contract', () => {
  it('keeps only scalar non-secret values in an audit snapshot', () => {
    const source = {
      accountId: 'account-1',
      username: 'teacher.one',
      isActive: true,
      attemptCount: 2,
      nullableValue: null,
      password: 'plain-password',
      passwordHash: 'password-hash',
      passwordSalt: 'password-salt',
      temporaryPassword: 'temporary-password',
      sessionToken: 'signed-session',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      secret: 'secret-value',
      nested: { unsafe: true },
      values: ['unsafe'],
    };

    const snapshot = sanitizeAuditSnapshot(source);

    expect(snapshot).toEqual({
      accountId: 'account-1',
      username: 'teacher.one',
      isActive: true,
      attemptCount: 2,
      nullableValue: null,
    });
    expect(source.passwordHash).toBe('password-hash');
    expect(source.nested).toEqual({ unsafe: true });
  });

  it('removes secret keys without regard to letter case', () => {
    const snapshot = sanitizeAuditSnapshot({
      Password: 'plain-password',
      PASSWORDHASH: 'password-hash',
      TemporaryCredential: 'temporary-password',
      SessionToken: 'signed-session',
      safeKey: 'safe-value',
    });

    expect(snapshot).toEqual({ safeKey: 'safe-value' });
  });
});
