import { describe, expect, it } from 'vitest';

import { seedLocalDemo } from '../../convex/demo';
import { DEMO_USERNAMES } from '../../lib/demo/scenarios';

type StoredDocument = Record<string, unknown> & { _id: string; _creationTime: number };
type QueryBuilder = {
  eq: (field: string, value: unknown) => QueryBuilder;
};

class MemoryDb {
  private sequence = 0;
  private readonly tables = new Map<string, Map<string, StoredDocument>>();

  seed(table: string, id: string, document: Record<string, unknown>) {
    this.table(table).set(id, { _id: id, _creationTime: ++this.sequence, ...document });
  }

  rows(table: string) {
    return [...this.table(table).values()];
  }

  async get(id: string) {
    for (const table of this.tables.values()) {
      const row = table.get(id);
      if (row) return row;
    }
    return null;
  }

  async insert(table: string, document: Record<string, unknown>) {
    const id = `${table}:${++this.sequence}`;
    this.seed(table, id, document);
    return id;
  }

  async patch(id: string, patch: Record<string, unknown>) {
    for (const table of this.tables.values()) {
      const row = table.get(id);
      if (row) {
        table.set(id, { ...row, ...patch });
        return;
      }
    }
    throw new Error(`Missing document ${id}`);
  }

  query(tableName: string) {
    let matches = this.rows(tableName);
    const query = {
      withIndex: (_index: string, configure: (builder: QueryBuilder) => unknown) => {
        const equalities: Array<[string, unknown]> = [];
        const builder: QueryBuilder = {
          eq: (field, value) => {
            equalities.push([field, value]);
            return builder;
          },
        };
        configure(builder);
        matches = matches.filter((row) => equalities.every(([field, value]) => row[field] === value));
        return query;
      },
      order: () => query,
      unique: async () => {
        if (matches.length > 1) throw new Error(`Expected one ${tableName} row`);
        return matches[0] ?? null;
      },
      take: async (count: number) => matches.slice(0, count),
    };
    return query;
  }

  context() {
    return { db: this };
  }

  private table(name: string) {
    let table = this.tables.get(name);
    if (!table) {
      table = new Map();
      this.tables.set(name, table);
    }
    return table;
  }
}

function handler(value: unknown) {
  return (value as { _handler: (ctx: unknown, args: unknown) => Promise<unknown> })._handler;
}

const seed = handler(seedLocalDemo);
const REFERENCE_TIME = Date.parse('2026-08-21T12:00:00.000Z');

function seedArgs() {
  return {
    organizationSlug: 'danielson-school',
    organizationName: 'Haidian Kaiwen Academy',
    referenceTime: REFERENCE_TIME,
    credentials: DEMO_USERNAMES.map((username, index) => ({
      username,
      passwordHash: `hash-${index}`,
      passwordSalt: `salt-${index}`,
      passwordHashIterations: 120_000,
      mustChangePassword: false,
    })),
  };
}

describe('local Danielson Convex demo seed', () => {
  it('creates the complete fictional organization and teacher scenarios', async () => {
    const db = new MemoryDb();

    await expect(seed(db.context(), seedArgs())).resolves.toMatchObject({
      kind: 'created',
      usernames: [...DEMO_USERNAMES],
    });
    expect(db.rows('organizations')).toHaveLength(1);
    expect(db.rows('organizations')[0]).toMatchObject({
      name: 'Haidian Kaiwen Academy',
      branding: {
        displayName: 'HDKWA',
        logoPath: '/brands/hdkwa-logo.png',
        primaryColor: '#003366',
        accentColor: '#C5A059',
      },
    });
    expect(db.rows('accounts')).toHaveLength(10);
    expect(db.rows('auth_credentials')).toHaveLength(10);
    expect(db.rows('teacher_profiles')).toHaveLength(7);
    expect(db.rows('departments')).toHaveLength(2);
    expect(db.rows('role_assignments')).toHaveLength(12);
    expect(db.rows('hod_assignments')).toHaveLength(1);
    expect(db.rows('coach_assignments')).toHaveLength(3);
    expect(db.rows('auth_credentials').every((row) => row.mustChangePassword === false)).toBe(true);
    expect(new Set(db.rows('auth_credentials').map((row) => row.passwordSalt)).size).toBe(10);

    expect(db.rows('teacher_observation_outcomes').length).toBeGreaterThan(0);
    expect(db.rows('teacher_proficiency').length).toBeGreaterThan(0);
    expect(db.rows('teacher_srs_cards').length).toBeGreaterThan(0);
    expect(db.rows('teacher_knowledge_state').length).toBeGreaterThan(0);
    expect(db.rows('teacher_priority').length).toBeGreaterThan(0);
    expect(db.rows('teacher_attention_summaries')).toHaveLength(7);
    const noahAccount = db.rows('accounts').find((row) => row.username === 'demo.teacher.developing');
    const noahProfile = db.rows('teacher_profiles').find((row) => row.accountId === noahAccount?._id);
    const noahSummary = db.rows('teacher_attention_summaries').find((row) => row.teacherProfileId === noahProfile?._id);
    expect(noahSummary).toEqual(expect.objectContaining({
      targets: expect.arrayContaining([
        expect.objectContaining({ skillId: 'danielson.tlac.skill.cold-call', currentProficiency: expect.objectContaining({ rawRating: 1 }) }),
        expect.objectContaining({ skillId: 'danielson.tlac.skill.stretch-it', currentProficiency: expect.objectContaining({ rawRating: 2 }) }),
        expect.objectContaining({ skillId: 'danielson.tlac.skill.turn-and-talk', currentProficiency: expect.objectContaining({ rawRating: 2 }) }),
      ]),
    }));
    expect(db.rows('improvement_plans')).toHaveLength(2);
    expect(db.rows('observation_public_comments')).toHaveLength(3);
    expect(db.rows('observation_private_comments')).toHaveLength(1);
    expect(db.rows('teacher_observation_responses')).toHaveLength(1);
    expect(db.rows('teacher_gbf_assignments')).toHaveLength(1);
  });

  it('returns already_seeded without adding rows on the second call', async () => {
    const db = new MemoryDb();
    await seed(db.context(), seedArgs());
    const counts = new Map([
      'organizations', 'accounts', 'auth_credentials', 'teacher_profiles', 'departments',
      'role_assignments', 'observation_records', 'teacher_proficiency', 'improvement_plans',
    ].map((table) => [table, db.rows(table).length]));

    await expect(seed(db.context(), seedArgs())).resolves.toMatchObject({ kind: 'already_seeded' });
    for (const [table, count] of counts) expect(db.rows(table)).toHaveLength(count);
  });

  it('requires a reset when the legacy organization has only identity rows', async () => {
    const db = new MemoryDb();
    db.seed('organizations', 'organizations:legacy-demo', {
      slug: 'danielson-school',
      name: 'Haidian Kaiwen Academy',
      isActive: true,
    });
    for (const [index, username] of DEMO_USERNAMES.entries()) {
      db.seed(`accounts`, `accounts:legacy-${index}`, {
        organizationId: 'organizations:legacy-demo',
        username,
        isActive: true,
      });
    }
    const before = db.rows('accounts').length;

    await expect(seed(db.context(), seedArgs())).resolves.toEqual({
      kind: 'conflict',
      reason: 'demo_reset_required',
    });
    expect(db.rows('accounts')).toHaveLength(before);
    expect(db.rows('teacher_profiles')).toHaveLength(0);
  });

  it('returns conflict without writing when the stable organization is mismatched', async () => {
    const db = new MemoryDb();
    db.seed('organizations', 'organizations:unrelated', {
      slug: 'danielson-school',
      name: 'Unrelated School',
      isActive: true,
    });

    await expect(seed(db.context(), seedArgs())).resolves.toMatchObject({ kind: 'conflict' });
    expect(db.rows('accounts')).toHaveLength(0);
    expect(db.rows('teacher_profiles')).toHaveLength(0);
  });

  it('keeps Not Enough Evidence outside rating, card, review, and mastery effects', async () => {
    const db = new MemoryDb();
    await seed(db.context(), seedArgs());
    const noEvidenceRows = db.rows('teacher_observation_outcomes')
      .filter((row) => (row.outcome as { kind?: string }).kind === 'not_enough_evidence');

    expect(noEvidenceRows.length).toBeGreaterThan(0);
    expect(db.rows('teacher_srs_reviews').length).toBeGreaterThan(0);
    expect(db.rows('teacher_knowledge_state').every((row) => row.state !== undefined)).toBe(true);
  });

  it('creates an active PIP for Ethan and a successful closed PIP for Lina', async () => {
    const db = new MemoryDb();
    await seed(db.context(), seedArgs());
    const plans = db.rows('improvement_plans');

    expect(plans).toEqual(expect.arrayContaining([
      expect.objectContaining({ state: 'active' }),
      expect.objectContaining({ state: 'closed', closureOutcome: 'successful' }),
    ]));
  });
});
