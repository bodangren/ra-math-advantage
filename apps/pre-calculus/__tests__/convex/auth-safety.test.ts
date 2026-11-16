import { describe, expect, it, vi } from 'vitest';
import * as auth from '@/convex/auth';

function database(rows: Record<string, any[]>) {
  const db = {
    query: (table: string) => ({ withIndex: (_name: string, predicate: any) => {
      const filters: [string, unknown][] = [];
      const q = { eq: (key: string, value: unknown) => { filters.push([key, value]); return q; } };
      predicate(q);
      return { unique: async () => (rows[table] ?? []).find(row => filters.every(([key, value]) => row[key] === value)) ?? null };
    } }),
    get: async (id: string) => Object.values(rows).flat().find(row => row._id === id) ?? null,
    insert: vi.fn(async (table: string, value: any) => { const row = { ...value, _id: `${table}-${(rows[table] ?? []).length}` }; (rows[table] ??= []).push(row); return row._id; }),
    patch: vi.fn(),
  };
  return db;
}
const input = { username: 'student', passwordHash: 'hash', passwordSalt: 'salt', passwordHashIterations: 120000 };
const credential = { ...input, _id: 'credential', profileId: 'profile', organizationId: 'org', role: 'student', isActive: true };

describe('account safety', () => {
  it('does not replace an existing account, including inactive accounts', async () => {
    for (const isActive of [true, false]) {
      const db = database({ profiles: [{ _id: 'profile', username: input.username }], auth_credentials: [{ ...credential, isActive }] });
      const result = await (auth as any).registerStudent._handler({ db }, input);
      expect(result).toEqual({ ok: false, reason: 'username_taken' });
      expect(db.patch).not.toHaveBeenCalled();
      expect(db.insert).not.toHaveBeenCalled();
    }
  });
  it('creates the profile and credential in the same mutation', async () => {
    const rows: Record<string, any[]> = {};
    const db = database(rows);
    expect(await (auth as any).registerStudent._handler({ db }, input)).toEqual({ ok: true });
    expect(rows.auth_credentials[0]).toMatchObject({ ...input, profileId: rows.profiles[0]._id, role: 'student', isActive: true });
  });
  it('returns the password verification fields to the internal login route', async () => {
    const db = database({ auth_credentials: [credential], profiles: [{ _id: 'profile', organizationId: 'org', role: 'student', username: 'student' }] });
    expect(await (auth.getCredentialByUsername as any)._handler({ db }, { username: 'student' })).toMatchObject(input);
  });
  it('rejects an inactive account session', async () => {
    const db = database({ profiles: [{ _id: 'profile', organizationId: 'org' }], auth_credentials: [{ ...credential, isActive: false }] });
    expect(await (auth.getAccountSettingsContext as any)._handler({ db }, { profileId: 'profile' })).toBeNull();
  });
});
