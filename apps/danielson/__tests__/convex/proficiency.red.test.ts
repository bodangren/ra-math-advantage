import { describe, expect, it } from 'vitest';

import {
  FIXED_NOW,
  ORGANIZATION_ID,
  TEACHER_ID,
  createRatedEvidence,
} from '../proficiency/fixtures';

type StoredDocument = Record<string, unknown> & { _id: string; _creationTime: number };

type Handler<TArgs, TResult> = (ctx: { db: MemoryDb }, args: TArgs) => Promise<TResult>;

function handler<TArgs, TResult>(value: unknown): Handler<TArgs, TResult> {
  return (value as { _handler: Handler<TArgs, TResult> })._handler;
}

class MemoryDb {
  private sequence = 0;
  private readonly tables = new Map<string, Map<string, StoredDocument>>();

  seed(table: string, id: string, document: Record<string, unknown>) {
    this.table(table).set(id, { _id: id, _creationTime: ++this.sequence, ...document });
  }

  rows(table: string): StoredDocument[] {
    return [...this.table(table).values()];
  }

  async get(id: string) {
    for (const table of this.tables.values()) {
      const document = table.get(id);
      if (document) return document;
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
      const document = table.get(id);
      if (document) {
        table.set(id, { ...document, ...patch });
        return;
      }
    }
    throw new Error(`Missing document ${id}`);
  }

  query(tableName: string) {
    let matches = this.rows(tableName);
    let descending = false;
    const query = {
      withIndex: (_name: string, configure: (builder: { eq: (field: string, value: unknown) => unknown }) => unknown) => {
        const equalities: Array<[string, unknown]> = [];
        const builder = {
          eq: (field: string, value: unknown) => {
            equalities.push([field, value]);
            return builder;
          },
        };
        configure(builder);
        matches = matches.filter((document) => equalities.every(([field, value]) => document[field] === value));
        return query;
      },
      order: (direction: 'asc' | 'desc') => {
        descending = direction === 'desc';
        return query;
      },
      unique: async () => {
        if (matches.length > 1) throw new Error(`Expected one ${tableName} row`);
        return matches[0] ?? null;
      },
      take: async (count: number) => {
        const ordered = descending ? [...matches].reverse() : matches;
        return ordered.slice(0, count);
      },
      paginate: async ({ cursor, numItems }: { cursor: string | null; numItems: number }) => {
        const start = cursor === null ? 0 : Number(cursor);
        const ordered = descending ? [...matches].reverse() : matches;
        const page = ordered.slice(start, start + numItems);
        const next = start + page.length;
        return { page, isDone: next >= ordered.length, continueCursor: next >= ordered.length ? '' : String(next) };
      },
    };
    return query;
  }

  context() {
    return { db: this };
  }

  private table(table: string) {
    let rows = this.tables.get(table);
    if (!rows) {
      rows = new Map();
      this.tables.set(table, rows);
    }
    return rows;
  }
}

function seedTeacher(db: MemoryDb) {
  db.seed('organizations', ORGANIZATION_ID, {
    slug: 'school', name: 'School', isActive: true, activeSysadminCount: 1,
  });
  db.seed('accounts', 'accounts:observer', {
    organizationId: ORGANIZATION_ID, username: 'observer', displayName: 'Observer',
    sharedSessionRole: 'admin', isActive: true,
  });
  db.seed('accounts', 'accounts:teacher', {
    organizationId: ORGANIZATION_ID, username: 'teacher', displayName: 'Teacher',
    sharedSessionRole: 'teacher', isActive: true,
  });
  db.seed('teacher_profiles', TEACHER_ID, {
    organizationId: ORGANIZATION_ID, accountId: 'accounts:teacher', isActive: true,
  });
}

describe('Danielson proficiency Convex persistence', () => {
  it('persists one tenant-scoped logical effect and exposes it through a bounded priority read', async () => {
    const { ingestObservationEvidence, readTeacherPriority } = await import('../../convex/proficiency');
    const ingest = handler<Record<string, unknown>, Record<string, unknown>>(ingestObservationEvidence);
    const readPriority = handler<Record<string, unknown>, Record<string, unknown>>(readTeacherPriority);
    const db = new MemoryDb();
    seedTeacher(db);

    for (let index = 0; index < 101; index += 1) {
      db.seed('teacher_srs_cards', `teacher_srs_cards:other-${index}`, {
        organizationId: 'organizations:other',
        teacherId: `teacher_profiles:other-${index}`,
        skillId: 'danielson.tlac.skill.other',
        variantKey: 'danielson.tlac.skill.other',
      });
    }

    const args = {
      actorAccountId: 'accounts:observer',
      organizationId: ORGANIZATION_ID,
      evidence: createRatedEvidence(),
      now: FIXED_NOW,
    };
    await expect(ingest(db.context(), args)).resolves.toMatchObject({ kind: 'applied' });
    await expect(ingest(db.context(), args)).resolves.toMatchObject({ kind: 'replayed' });

    expect(db.rows('teacher_proficiency_idempotency')).toHaveLength(1);
    expect(db.rows('teacher_observation_outcomes')).toHaveLength(1);
    expect(db.rows('teacher_srs_cards')).toHaveLength(104);
    expect(db.rows('teacher_srs_reviews')).toHaveLength(3);

    const priority = await readPriority(db.context(), {
      organizationId: ORGANIZATION_ID,
      teacherId: TEACHER_ID,
      now: FIXED_NOW,
    });
    expect(priority).toMatchObject({
      kind: 'allowed',
      items: expect.arrayContaining([
        expect.objectContaining({ skillId: 'danielson.tlac.skill.double-plan' }),
      ]),
    });
  });

  it('rejects a same-key conflict and refuses cross-organization persistence reads', async () => {
    const { ingestObservationEvidence, readTeacherPriority } = await import('../../convex/proficiency');
    const ingest = handler<Record<string, unknown>, Record<string, unknown>>(ingestObservationEvidence);
    const readPriority = handler<Record<string, unknown>, Record<string, unknown>>(readTeacherPriority);
    const db = new MemoryDb();
    seedTeacher(db);
    const baseArgs = {
      actorAccountId: 'accounts:observer',
      organizationId: ORGANIZATION_ID,
      evidence: createRatedEvidence(),
      now: FIXED_NOW,
    };

    await expect(ingest(db.context(), baseArgs)).resolves.toMatchObject({ kind: 'applied' });
    await expect(ingest(db.context(), {
      ...baseArgs,
      evidence: createRatedEvidence({ rating: 1 }),
    })).resolves.toMatchObject({ kind: 'conflict' });
    expect(db.rows('teacher_observation_outcomes')).toHaveLength(1);

    await expect(readPriority(db.context(), {
      organizationId: 'organizations:other',
      teacherId: TEACHER_ID,
      now: FIXED_NOW,
    })).resolves.toMatchObject({ kind: 'denied' });
  });
});
