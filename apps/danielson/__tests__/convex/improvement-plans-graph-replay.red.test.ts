import { describe, expect, it, vi } from 'vitest';

const COMPONENT_ID = 'danielson.framework.component.1e';
const SKILL_ID = 'danielson.tlac.skill.double-plan';
const NOW = Date.parse('2026-09-01T00:00:00.000Z');

const graphState = vi.hoisted(() => ({
  graph: {
    nodes: [
      {
        id: 'danielson.framework.component.1e',
        kind: 'instructional_unit',
        title: '1e: Planning Coherent Instruction',
        domain: 'danielson',
        sourceRefs: [{ source: 'Danielson Framework for Teaching 2022' }],
        reviewStatus: 'approved',
        metadata: {},
      },
      {
        id: 'danielson.tlac.skill.double-plan',
        kind: 'skill',
        title: 'Double Plan',
        domain: 'danielson',
        sourceRefs: [{ source: 'Teach Like a Champion 3.0' }],
        reviewStatus: 'approved',
        metadata: {},
      },
    ],
    edges: [{
      id: 'danielson.edge.contains.1e.double-plan',
      type: 'contains',
      sourceId: 'danielson.framework.component.1e',
      targetId: 'danielson.tlac.skill.double-plan',
      weight: 1,
      confidence: 'high',
      sourceRefs: [{ source: 'Teach Like a Champion 3.0' }],
      reviewStatus: 'approved',
      metadata: {},
    }],
  },
}));

vi.mock('../../lib/proficiency/graph', () => ({
  buildDanielsonGraph: () => ({ graph: graphState.graph }),
}));

const { createImprovementPlanProposal } = await import('../../convex/improvementPlans');

type StoredDocument = Record<string, unknown> & { _id: string; _creationTime: number };
type Handler<TArgs = Record<string, unknown>, TResult = Record<string, unknown>> = (
  ctx: { db: MemoryDb },
  args: TArgs,
) => Promise<TResult>;

function handler<TArgs = Record<string, unknown>, TResult = Record<string, unknown>>(
  value: unknown,
): Handler<TArgs, TResult> {
  return (value as { _handler: Handler<TArgs, TResult> })._handler;
}

class MemoryDb {
  private sequence = 0;
  private readonly tables = new Map<string, Map<string, StoredDocument>>();

  seed(table: string, id: string, document: Record<string, unknown>) {
    this.table(table).set(id, { _id: id, _creationTime: ++this.sequence, ...document });
  }

  async get(id: unknown) {
    if (typeof id !== 'string') return null;
    for (const rows of this.tables.values()) {
      const document = rows.get(id);
      if (document) return document;
    }
    return null;
  }

  normalizeId(table: string, id: string) {
    return this.table(table).has(id) ? id : null;
  }

  async insert(table: string, document: Record<string, unknown>) {
    const id = `${table}:${++this.sequence}`;
    this.seed(table, id, document);
    return id;
  }

  async patch(id: string, patch: Record<string, unknown>) {
    for (const rows of this.tables.values()) {
      const current = rows.get(id);
      if (current) {
        rows.set(id, { ...current, ...patch });
        return;
      }
    }
    throw new Error(`Missing ${id}`);
  }

  query(tableName: string) {
    let matches = [...this.table(tableName).values()];
    const query = {
      withIndex: (
        _name: string,
        configure: (builder: { eq: (field: string, value: unknown) => unknown }) => unknown,
      ) => {
        const equalities: Array<[string, unknown]> = [];
        const builder = {
          eq: (field: string, value: unknown) => {
            equalities.push([field, value]);
            return builder;
          },
        };
        configure(builder);
        matches = matches.filter((document) => (
          equalities.every(([field, value]) => document[field] === value)
        ));
        return query;
      },
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

  private table(table: string) {
    let rows = this.tables.get(table);
    if (!rows) {
      rows = new Map();
      this.tables.set(table, rows);
    }
    return rows;
  }
}

function seedBase(db: MemoryDb) {
  db.seed('organizations', 'organizations:one', {
    slug: 'one',
    name: 'School One',
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  });
  db.seed('accounts', 'accounts:supervisor', {
    organizationId: 'organizations:one',
    username: 'supervisor',
    displayName: 'Supervisor One',
    sharedSessionRole: 'admin',
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  });
  db.seed('accounts', 'accounts:teacher', {
    organizationId: 'organizations:one',
    username: 'teacher',
    displayName: 'Teacher One',
    sharedSessionRole: 'teacher',
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  });
  db.seed('role_assignments', 'role_assignments:supervisor', {
    organizationId: 'organizations:one',
    accountId: 'accounts:supervisor',
    role: 'school_head',
    status: 'active',
    createdByAccountId: 'accounts:supervisor',
    createdAt: NOW,
  });
  db.seed('role_assignments', 'role_assignments:teacher', {
    organizationId: 'organizations:one',
    accountId: 'accounts:teacher',
    role: 'teacher',
    status: 'active',
    createdByAccountId: 'accounts:supervisor',
    createdAt: NOW,
  });
  db.seed('teacher_profiles', 'teacher_profiles:one', {
    organizationId: 'organizations:one',
    accountId: 'accounts:teacher',
    position: 'Mathematics Teacher',
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  });
  db.seed('departments', 'departments:math', {
    organizationId: 'organizations:one',
    key: 'math',
    name: 'Mathematics',
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  });
  db.seed('department_memberships', 'department_memberships:teacher', {
    organizationId: 'organizations:one',
    departmentId: 'departments:math',
    teacherProfileId: 'teacher_profiles:one',
    status: 'active',
    createdByAccountId: 'accounts:supervisor',
    createdAt: NOW,
  });
}

function proposalArgs() {
  return {
    actorAccountId: 'accounts:supervisor',
    teacherProfileId: 'teacher_profiles:one',
    planId: null,
    requestId: 'request:graph-replay',
    expectedRevision: 0,
    position: 'Client-supplied position',
    departmentId: 'departments:math',
    reviewMeetingDate: '2026-09-20',
    requestedPlanEndDate: null,
    purpose: 'Improve lesson coherence.',
    areasOfConcern: 'Lesson tasks do not follow a clear sequence.',
    expectedStandard: 'Danielson Proficient.',
    requiredActions: 'Use Double Plan for each observed lesson.',
    evidenceOfImprovement: 'Walkthrough evidence.',
    schoolSupport: 'Weekly planning meeting.',
    successfulCompletionCriteria: 'Rating 3 or higher.',
    targets: [{ componentId: COMPONENT_ID, skillId: SKILL_ID, expectedRating: 3 }],
    now: NOW,
  };
}

describe('PIP proposal replay after graph changes', () => {
  it('replays the accepted proposal when its target stops being approved later', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const propose = handler(createImprovementPlanProposal);
    const first = await propose(db.context(), proposalArgs()) as Record<string, unknown>;
    const skill = graphState.graph.nodes.find((node) => node.id === SKILL_ID);
    if (!skill) throw new Error('The graph test skill is missing.');
    skill.reviewStatus = 'draft';

    await expect(propose(db.context(), proposalArgs())).resolves.toEqual({
      ...first,
      kind: 'replayed',
    });
  });
});
