// Phase 1.2 — Parent↔student linking mechanism (Red phase, TDD).
//
// Contract under test (per spec.md FR2 + AC2 and test-strategy.md §5):
//
//   "A mechanism (teacher-initiated or invite/code) to link a parent to
//    one or more students, revocable."
//
// Concretely, the convex module `apps/integrated-math-3/convex/parent/links.ts`
// must export at minimum:
//
//   - `createParentLink(ctx, { callerProfileId, parentProfileId, studentProfileId })`
//       Caller must be teacher/admin (fail-closed). Creates an active
//       `parent_links` row. Idempotent: re-creating an active link for the
//       same (parent, student) pair returns the existing link rather than
//       inserting a duplicate.
//
//   - `revokeParentLink(ctx, { callerProfileId, linkId })`
//       Caller must be teacher/admin (fail-closed). Transitions status
//       from 'active' to 'revoked'. Returns ok=true with link id on success.
//
//   - `listParentLinks(ctx, { parentProfileId })`
//       Returns all parent_links rows for the given parent (active, pending,
//       and revoked). Callers that need only active links filter themselves.
//       Empty array when none exist.
//
// `parent_links` table shape (expected):
//   _id: Id<'parent_links'>
//   _creationTime: number
//   parentId: Id<'profiles'>     // role === 'parent'
//   studentId: Id<'profiles'>    // role === 'student'
//   status: 'active' | 'revoked' | 'pending'
//   organizationId: Id<'organizations'>  // for tenant isolation
//   createdBy: Id<'profiles'>    // teacher/admin who created the link
//   createdAt: number
//   revokedAt: number | null
//   revokedBy: Id<'profiles'> | null
//   metadata: Record<string, unknown>
//
// Red signal: the module does not exist yet, so all value imports fail to
// resolve. The mock-ctx fixture is intentionally minimal — only the four
// tables the linking logic touches are wired up. Production module is
// expected to validate teacher/admin auth, organization match, and idempotency
// at the database boundary.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Id } from '@/convex/_generated/dataModel';

import {
  createParentLink,
  revokeParentLink,
  listParentLinks,
  type CreateParentLinkResult,
  type RevokeParentLinkResult,
} from '@/convex/parent/links'; // Intentional: non-existent module → Red.

// ---------------------------------------------------------------------------
// Mock Convex ctx — minimal tables for parent_links.
//
// Mirrors the pattern in __tests__/convex/_helpers/mockRosterCtx.ts but
// scoped to the linking flow. Per test-strategy.md §2 "convexMocks.ts",
// live-behavior tests use vi.mock against the real Convex module path; this
// helper exists to give the unit tests a deterministic DB without booting a
// real convex backend.
// ---------------------------------------------------------------------------

interface ProfileRow {
  _id: Id<'profiles'>;
  _creationTime: number;
  organizationId: Id<'organizations'>;
  username: string;
  role: 'student' | 'teacher' | 'admin' | 'parent';
  displayName?: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

interface ParentLinkRow {
  _id: Id<'parent_links'>;
  _creationTime: number;
  parentId: Id<'profiles'>;
  studentId: Id<'profiles'>;
  organizationId: Id<'organizations'>;
  status: 'active' | 'revoked' | 'pending';
  createdBy: Id<'profiles'>;
  createdAt: number;
  revokedAt: number | null;
  revokedBy: Id<'profiles'> | null;
  metadata: Record<string, unknown>;
}

interface MakeParentLinkCtxOptions {
  profiles?: ProfileRow[];
  parentLinks?: ParentLinkRow[];
}

interface ParentLinkMockCtx {
  db: {
    query: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  profiles: ProfileRow[];
  parentLinks: ParentLinkRow[];
  insertSpy: ReturnType<typeof vi.fn>;
  patchSpy: ReturnType<typeof vi.fn>;
}

let profileIdCounter = 1;
let parentLinkIdCounter = 1;

function makeParentLinkMockCtx(
  options: MakeParentLinkCtxOptions = {},
): ParentLinkMockCtx {
  const profiles: ProfileRow[] = options.profiles ? [...options.profiles] : [];
  const parentLinks: ParentLinkRow[] = options.parentLinks ? [...options.parentLinks] : [];

  const insertSpy = vi.fn().mockImplementation(
    (table: string, doc: Record<string, unknown>) => {
      const now = Date.now();
      switch (table) {
        case 'profiles': {
          const id = `profiles_${profileIdCounter++}` as Id<'profiles'>;
          const row: ProfileRow = { _id: id, _creationTime: now, ...doc } as ProfileRow;
          profiles.push(row);
          return Promise.resolve(id);
        }
        case 'parent_links': {
          const id = `parent_links_${parentLinkIdCounter++}` as Id<'parent_links'>;
          const row: ParentLinkRow = {
            _id: id,
            _creationTime: now,
            revokedAt: null,
            revokedBy: null,
            metadata: {},
            ...doc,
          } as ParentLinkRow;
          parentLinks.push(row);
          return Promise.resolve(id);
        }
        default:
          return Promise.resolve(`unknown_${table}_1` as unknown as Id<'profiles'>);
      }
    },
  );

  const patchSpy = vi.fn().mockImplementation(
    (id: string, updates: Record<string, unknown>) => {
      const found = parentLinks.find((d) => d._id === id);
      if (found) {
        Object.assign(found, updates, { updatedAt: Date.now() });
      }
      return Promise.resolve(undefined);
    },
  );

  return {
    db: {
      query: vi.fn().mockImplementation((tableName: string) => {
        switch (tableName) {
          case 'profiles':
            return {
              withIndex: vi.fn().mockImplementation(
                (
                  indexName: string,
                  builder?: (q: { eq: (f: string, v: unknown) => unknown }) => unknown,
                ) => {
                  let filtered: ProfileRow[] = [...profiles];
                  const eqChain = {
                    eq: (field: string, value: unknown) => {
                      filtered = filtered.filter(
                        (d) => (d as unknown as Record<string, unknown>)[field] === value,
                      );
                      return eqChain;
                    },
                  };
                  if (builder) builder(eqChain);
                  return {
                    collect: () => Promise.resolve(filtered),
                    first: () => Promise.resolve(filtered[0] ?? null),
                    unique: () => Promise.resolve(filtered[0] ?? null),
                  };
                },
              ),
            };
          case 'parent_links':
            return {
              withIndex: vi.fn().mockImplementation(
                (
                  indexName: string,
                  builder?: (q: { eq: (f: string, v: unknown) => unknown }) => unknown,
                ) => {
                  let filtered: ParentLinkRow[] = [...parentLinks];
                  const eqChain = {
                    eq: (field: string, value: unknown) => {
                      filtered = filtered.filter(
                        (d) => (d as unknown as Record<string, unknown>)[field] === value,
                      );
                      return eqChain;
                    },
                  };
                  if (builder) builder(eqChain);
                  return {
                    collect: () => Promise.resolve(filtered),
                    first: () => Promise.resolve(filtered[0] ?? null),
                    unique: () => Promise.resolve(filtered[0] ?? null),
                  };
                },
              ),
            };
          default:
            return {
              withIndex: vi.fn().mockReturnThis(),
              collect: vi.fn().mockResolvedValue([]),
              first: vi.fn().mockResolvedValue(null),
              unique: vi.fn().mockResolvedValue(null),
            };
        }
      }),
      insert: insertSpy,
      get: vi.fn().mockImplementation((id: string) => {
        const all = [...profiles, ...parentLinks];
        const found = all.find((d) => (d as { _id: string })._id === id);
        return Promise.resolve(found ?? null);
      }),
      patch: patchSpy,
      delete: vi.fn().mockResolvedValue(undefined),
    },
    profiles,
    parentLinks,
    insertSpy,
    patchSpy,
  };
}

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const FIXED_TEST_ORG = 'organizations_test_1' as Id<'organizations'>;

function makeTeacher(overrides: Partial<ProfileRow> = {}): ProfileRow {
  return {
    _id: 'profiles_teacher_1' as Id<'profiles'>,
    _creationTime: 1_780_000_000_000,
    organizationId: FIXED_TEST_ORG,
    username: 'teacher.test',
    role: 'teacher',
    displayName: 'Test Teacher',
    metadata: {},
    createdAt: 1_780_000_000_000,
    updatedAt: 1_780_000_000_000,
    ...overrides,
  };
}

function makeParent(overrides: Partial<ProfileRow> = {}): ProfileRow {
  return {
    _id: 'profiles_parent_1' as Id<'profiles'>,
    _creationTime: 1_780_000_000_000,
    organizationId: FIXED_TEST_ORG,
    username: 'parent.test',
    role: 'parent',
    displayName: 'Test Parent',
    metadata: {},
    createdAt: 1_780_000_000_000,
    updatedAt: 1_780_000_000_000,
    ...overrides,
  };
}

function makeStudent(overrides: Partial<ProfileRow> = {}): ProfileRow {
  return {
    _id: 'profiles_student_1' as Id<'profiles'>,
    _creationTime: 1_780_000_000_000,
    organizationId: FIXED_TEST_ORG,
    username: 'student.test',
    role: 'student',
    displayName: 'Test Student',
    metadata: {},
    createdAt: 1_780_000_000_000,
    updatedAt: 1_780_000_000_000,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// createParentLink
// ---------------------------------------------------------------------------

describe('createParentLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns forbidden when caller is a parent (fail-closed role)', async () => {
    const ctx = makeParentLinkMockCtx({
      profiles: [makeTeacher(), makeParent({ _id: 'profiles_caller' as Id<'profiles'> }), makeStudent()],
    });
    const result = await createParentLink(ctx as unknown as Parameters<typeof createParentLink>[0], {
      callerProfileId: 'profiles_caller' as Id<'profiles'>,
      parentProfileId: 'profiles_parent_1' as Id<'profiles'>,
      studentProfileId: 'profiles_student_1' as Id<'profiles'>,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('forbidden');
    }
  });

  it('returns forbidden when caller is a student (fail-closed role)', async () => {
    const ctx = makeParentLinkMockCtx({
      profiles: [
        makeTeacher(),
        makeParent(),
        makeStudent({ _id: 'profiles_caller' as Id<'profiles'> }),
      ],
    });
    const result = await createParentLink(ctx as unknown as Parameters<typeof createParentLink>[0], {
      callerProfileId: 'profiles_caller' as Id<'profiles'>,
      parentProfileId: 'profiles_parent_1' as Id<'profiles'>,
      studentProfileId: 'profiles_student_1' as Id<'profiles'>,
    });
    expect(result.ok).toBe(false);
  });

  it('returns parent_not_found when parent profile does not exist', async () => {
    const ctx = makeParentLinkMockCtx({ profiles: [makeTeacher(), makeStudent()] });
    const result = await createParentLink(ctx as unknown as Parameters<typeof createParentLink>[0], {
      callerProfileId: 'profiles_teacher_1' as Id<'profiles'>,
      parentProfileId: 'profiles_does_not_exist' as Id<'profiles'>,
      studentProfileId: 'profiles_student_1' as Id<'profiles'>,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('parent_not_found');
    }
  });

  it('returns student_not_found when student profile does not exist', async () => {
    const ctx = makeParentLinkMockCtx({ profiles: [makeTeacher(), makeParent()] });
    const result = await createParentLink(ctx as unknown as Parameters<typeof createParentLink>[0], {
      callerProfileId: 'profiles_teacher_1' as Id<'profiles'>,
      parentProfileId: 'profiles_parent_1' as Id<'profiles'>,
      studentProfileId: 'profiles_does_not_exist' as Id<'profiles'>,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('student_not_found');
    }
  });

  it('returns invalid_target_role when parent profile is not a parent role', async () => {
    const ctx = makeParentLinkMockCtx({
      profiles: [makeTeacher(), makeParent({ role: 'student' }), makeStudent()],
    });
    const result = await createParentLink(ctx as unknown as Parameters<typeof createParentLink>[0], {
      callerProfileId: 'profiles_teacher_1' as Id<'profiles'>,
      parentProfileId: 'profiles_parent_1' as Id<'profiles'>,
      studentProfileId: 'profiles_student_1' as Id<'profiles'>,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('invalid_target_role');
    }
  });

  it('returns invalid_target_role when student profile is not a student role', async () => {
    const ctx = makeParentLinkMockCtx({
      profiles: [makeTeacher(), makeParent(), makeStudent({ role: 'teacher' })],
    });
    const result = await createParentLink(ctx as unknown as Parameters<typeof createParentLink>[0], {
      callerProfileId: 'profiles_teacher_1' as Id<'profiles'>,
      parentProfileId: 'profiles_parent_1' as Id<'profiles'>,
      studentProfileId: 'profiles_student_1' as Id<'profiles'>,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('invalid_target_role');
    }
  });

  it('returns org_mismatch when parent and student are in different organizations', async () => {
    const otherOrg = 'organizations_other' as Id<'organizations'>;
    const ctx = makeParentLinkMockCtx({
      profiles: [
        makeTeacher(),
        makeParent(),
        makeStudent({ organizationId: otherOrg }),
      ],
    });
    const result = await createParentLink(ctx as unknown as Parameters<typeof createParentLink>[0], {
      callerProfileId: 'profiles_teacher_1' as Id<'profiles'>,
      parentProfileId: 'profiles_parent_1' as Id<'profiles'>,
      studentProfileId: 'profiles_student_1' as Id<'profiles'>,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('org_mismatch');
    }
  });

  it('returns ok=true with link id when caller is teacher and both targets exist', async () => {
    const ctx = makeParentLinkMockCtx({
      profiles: [makeTeacher(), makeParent(), makeStudent()],
    });
    const result: CreateParentLinkResult = await createParentLink(
      ctx as unknown as Parameters<typeof createParentLink>[0],
      {
        callerProfileId: 'profiles_teacher_1' as Id<'profiles'>,
        parentProfileId: 'profiles_parent_1' as Id<'profiles'>,
        studentProfileId: 'profiles_student_1' as Id<'profiles'>,
      },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(typeof result.linkId).toBe('string');
    }
  });

  it('is idempotent: a second create for the same (parent, student) pair returns the existing link', async () => {
    const ctx = makeParentLinkMockCtx({
      profiles: [makeTeacher(), makeParent(), makeStudent()],
    });
    const first = await createParentLink(
      ctx as unknown as Parameters<typeof createParentLink>[0],
      {
        callerProfileId: 'profiles_teacher_1' as Id<'profiles'>,
        parentProfileId: 'profiles_parent_1' as Id<'profiles'>,
        studentProfileId: 'profiles_student_1' as Id<'profiles'>,
      },
    );
    const second = await createParentLink(
      ctx as unknown as Parameters<typeof createParentLink>[0],
      {
        callerProfileId: 'profiles_teacher_1' as Id<'profiles'>,
        parentProfileId: 'profiles_parent_1' as Id<'profiles'>,
        studentProfileId: 'profiles_student_1' as Id<'profiles'>,
      },
    );
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.linkId).toBe(first.linkId);
    }
  });

  it('re-creates an active link when a previous link for the same (parent, student) was revoked', async () => {
    // Adversarial: spec FR2 says linking is "revocable". After a revoke the
    // teacher must be able to re-link the same parent/student pair. The
    // implementation previously short-circuited on any existing row — even a
    // revoked one — and returned the revoked link's id, which is then
    // invisible to listParentLinks (status==='active' filter). Re-link path
    // is the realistic Phase-2 follow-up; this test makes the contract
    // explicit and prevents regression.
    const revoked: ParentLinkRow = {
      _id: 'parent_links_revoked' as Id<'parent_links'>,
      _creationTime: 1_780_000_000_000,
      parentId: 'profiles_parent_1' as Id<'profiles'>,
      studentId: 'profiles_student_1' as Id<'profiles'>,
      organizationId: FIXED_TEST_ORG,
      status: 'revoked',
      createdBy: 'profiles_teacher_1' as Id<'profiles'>,
      createdAt: 1_780_000_000_000,
      revokedAt: 1_780_000_000_500,
      revokedBy: 'profiles_teacher_1' as Id<'profiles'>,
      metadata: {},
    };
    const ctx = makeParentLinkMockCtx({
      profiles: [makeTeacher(), makeParent(), makeStudent()],
      parentLinks: [revoked],
    });
    const result = await createParentLink(
      ctx as unknown as Parameters<typeof createParentLink>[0],
      {
        callerProfileId: 'profiles_teacher_1' as Id<'profiles'>,
        parentProfileId: 'profiles_parent_1' as Id<'profiles'>,
        studentProfileId: 'profiles_student_1' as Id<'profiles'>,
      },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Must be a new active link, not the revoked one.
      expect(result.linkId).not.toBe('parent_links_revoked');
    }
    // Verify the new link is actually present and active in the table.
    const activeLinks = ctx.parentLinks.filter(
      (l) => l.parentId === ('profiles_parent_1' as Id<'profiles'>) && l.status === 'active',
    );
    expect(activeLinks).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// revokeParentLink
// ---------------------------------------------------------------------------

describe('revokeParentLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns forbidden when caller is a parent (fail-closed role)', async () => {
    const link: ParentLinkRow = {
      _id: 'parent_links_existing' as Id<'parent_links'>,
      _creationTime: 1_780_000_000_000,
      parentId: 'profiles_parent_1' as Id<'profiles'>,
      studentId: 'profiles_student_1' as Id<'profiles'>,
      organizationId: FIXED_TEST_ORG,
      status: 'active',
      createdBy: 'profiles_teacher_1' as Id<'profiles'>,
      createdAt: 1_780_000_000_000,
      revokedAt: null,
      revokedBy: null,
      metadata: {},
    };
    const ctx = makeParentLinkMockCtx({
      profiles: [makeTeacher(), makeParent({ _id: 'profiles_caller' as Id<'profiles'> }), makeStudent()],
      parentLinks: [link],
    });
    const result = await revokeParentLink(ctx as unknown as Parameters<typeof revokeParentLink>[0], {
      callerProfileId: 'profiles_caller' as Id<'profiles'>,
      linkId: 'parent_links_existing' as Id<'parent_links'>,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('forbidden');
    }
  });

  it('returns link_not_found when the link does not exist', async () => {
    const ctx = makeParentLinkMockCtx({
      profiles: [makeTeacher(), makeParent(), makeStudent()],
    });
    const result = await revokeParentLink(ctx as unknown as Parameters<typeof revokeParentLink>[0], {
      callerProfileId: 'profiles_teacher_1' as Id<'profiles'>,
      linkId: 'parent_links_missing' as Id<'parent_links'>,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('link_not_found');
    }
  });

  it('transitions status from active to revoked and returns ok=true', async () => {
    const link: ParentLinkRow = {
      _id: 'parent_links_existing' as Id<'parent_links'>,
      _creationTime: 1_780_000_000_000,
      parentId: 'profiles_parent_1' as Id<'profiles'>,
      studentId: 'profiles_student_1' as Id<'profiles'>,
      organizationId: FIXED_TEST_ORG,
      status: 'active',
      createdBy: 'profiles_teacher_1' as Id<'profiles'>,
      createdAt: 1_780_000_000_000,
      revokedAt: null,
      revokedBy: null,
      metadata: {},
    };
    const ctx = makeParentLinkMockCtx({
      profiles: [makeTeacher(), makeParent(), makeStudent()],
      parentLinks: [link],
    });
    const result: RevokeParentLinkResult = await revokeParentLink(
      ctx as unknown as Parameters<typeof revokeParentLink>[0],
      {
        callerProfileId: 'profiles_teacher_1' as Id<'profiles'>,
        linkId: 'parent_links_existing' as Id<'parent_links'>,
      },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.linkId).toBe('parent_links_existing');
    }
    expect(ctx.parentLinks[0].status).toBe('revoked');
    expect(ctx.parentLinks[0].revokedBy).toBe('profiles_teacher_1');
    expect(typeof ctx.parentLinks[0].revokedAt).toBe('number');
  });

  it('is idempotent: revoking an already-revoked link returns ok=true without re-patching', async () => {
    const link: ParentLinkRow = {
      _id: 'parent_links_existing' as Id<'parent_links'>,
      _creationTime: 1_780_000_000_000,
      parentId: 'profiles_parent_1' as Id<'profiles'>,
      studentId: 'profiles_student_1' as Id<'profiles'>,
      organizationId: FIXED_TEST_ORG,
      status: 'revoked',
      createdBy: 'profiles_teacher_1' as Id<'profiles'>,
      createdAt: 1_780_000_000_000,
      revokedAt: 1_780_000_100_000,
      revokedBy: 'profiles_teacher_1' as Id<'profiles'>,
      metadata: {},
    };
    const ctx = makeParentLinkMockCtx({
      profiles: [makeTeacher(), makeParent(), makeStudent()],
      parentLinks: [link],
    });
    const result = await revokeParentLink(ctx as unknown as Parameters<typeof revokeParentLink>[0], {
      callerProfileId: 'profiles_teacher_1' as Id<'profiles'>,
      linkId: 'parent_links_existing' as Id<'parent_links'>,
    });
    expect(result.ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// listParentLinks
// ---------------------------------------------------------------------------

describe('listParentLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty array when the parent has no links', async () => {
    const ctx = makeParentLinkMockCtx({
      profiles: [makeTeacher(), makeParent(), makeStudent()],
    });
    const links = await listParentLinks(
      ctx as unknown as Parameters<typeof listParentLinks>[0],
      { parentProfileId: 'profiles_parent_1' as Id<'profiles'> },
    );
    expect(Array.isArray(links)).toBe(true);
    expect(links).toHaveLength(0);
  });

  it('returns all links for the requested parent', async () => {
    const active: ParentLinkRow = {
      _id: 'parent_links_active' as Id<'parent_links'>,
      _creationTime: 1_780_000_000_000,
      parentId: 'profiles_parent_1' as Id<'profiles'>,
      studentId: 'profiles_student_1' as Id<'profiles'>,
      organizationId: FIXED_TEST_ORG,
      status: 'active',
      createdBy: 'profiles_teacher_1' as Id<'profiles'>,
      createdAt: 1_780_000_000_000,
      revokedAt: null,
      revokedBy: null,
      metadata: {},
    };
    const revoked: ParentLinkRow = {
      _id: 'parent_links_revoked' as Id<'parent_links'>,
      _creationTime: 1_780_000_000_001,
      parentId: 'profiles_parent_1' as Id<'profiles'>,
      studentId: 'profiles_student_2' as Id<'profiles'>,
      organizationId: FIXED_TEST_ORG,
      status: 'revoked',
      createdBy: 'profiles_teacher_1' as Id<'profiles'>,
      createdAt: 1_780_000_000_001,
      revokedAt: 1_780_000_000_002,
      revokedBy: 'profiles_teacher_1' as Id<'profiles'>,
      metadata: {},
    };
    const ctx = makeParentLinkMockCtx({
      profiles: [makeTeacher(), makeParent(), makeStudent()],
      parentLinks: [active, revoked],
    });
    const links = await listParentLinks(
      ctx as unknown as Parameters<typeof listParentLinks>[0],
      { parentProfileId: 'profiles_parent_1' as Id<'profiles'> },
    );
    expect(links).toHaveLength(2);
  });

  it('does not return links belonging to other parents', async () => {
    const otherParentLink: ParentLinkRow = {
      _id: 'parent_links_other' as Id<'parent_links'>,
      _creationTime: 1_780_000_000_000,
      parentId: 'profiles_other_parent' as Id<'profiles'>,
      studentId: 'profiles_student_1' as Id<'profiles'>,
      organizationId: FIXED_TEST_ORG,
      status: 'active',
      createdBy: 'profiles_teacher_1' as Id<'profiles'>,
      createdAt: 1_780_000_000_000,
      revokedAt: null,
      revokedBy: null,
      metadata: {},
    };
    const ctx = makeParentLinkMockCtx({
      profiles: [makeTeacher(), makeParent(), makeStudent()],
      parentLinks: [otherParentLink],
    });
    const links = await listParentLinks(
      ctx as unknown as Parameters<typeof listParentLinks>[0],
      { parentProfileId: 'profiles_parent_1' as Id<'profiles'> },
    );
    expect(links).toHaveLength(0);
  });
});
