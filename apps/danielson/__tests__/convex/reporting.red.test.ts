import { describe, expect, it } from 'vitest';

import {
  addPrivateObservationComment,
  addPublicObservationComment,
  listLeadershipPrivateComments,
  listLeadershipPublicComments,
  listMyPublicComments,
  readLeadershipPortfolio,
  readLeadershipTeacherReport,
  readMyTeacherReport,
  submitTeacherResponse,
} from '../../convex/reporting';
import { GBF_ACTION_STEPS, GBF_MAPPINGS } from '../../lib/gbf/source';
import { buildDanielsonGraph } from '../../lib/proficiency/graph';

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
  readonly queryCalls: Array<{ table: string; index: string | null; take: number | null }> = [];

  seed(table: string, id: string, document: Record<string, unknown>) {
    this.table(table).set(id, { _id: id, _creationTime: ++this.sequence, ...document });
  }

  rows(table: string): StoredDocument[] {
    return [...(this.tables.get(table)?.values() ?? [])];
  }

  snapshot() {
    return structuredClone(Object.fromEntries(
      [...this.tables.entries()].map(([name, rows]) => [name, [...rows.values()]]),
    ));
  }

  async get(id: unknown) {
    if (typeof id !== 'string') return null;
    for (const table of this.tables.values()) {
      const document = table.get(id);
      if (document) return document;
    }
    return null;
  }

  normalizeId(table: string, id: string) {
    return this.tables.get(table)?.has(id) ? id : null;
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

  async delete(id: string) {
    for (const table of this.tables.values()) {
      if (table.delete(id)) return;
    }
    throw new Error(`Missing document ${id}`);
  }

  query(tableName: string) {
    let matches = this.rows(tableName);
    let descending = false;
    const call = { table: tableName, index: null as string | null, take: null as number | null };
    this.queryCalls.push(call);
    const query = {
      withIndex: (
        name: string,
        configure: (builder: { eq: (field: string, value: unknown) => unknown }) => unknown,
      ) => {
        call.index = name;
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
      order: (direction: 'asc' | 'desc') => {
        descending = direction === 'desc';
        return query;
      },
      unique: async () => {
        if (matches.length > 1) throw new Error(`Expected one ${tableName} row`);
        return matches[0] ?? null;
      },
      first: async () => {
        const ordered = descending ? [...matches].reverse() : matches;
        return ordered[0] ?? null;
      },
      take: async (count: number) => {
        call.take = count;
        const ordered = descending ? [...matches].reverse() : matches;
        return ordered.slice(0, count);
      },
      collect: async () => {
        throw new Error(`Unbounded collect is prohibited for ${tableName}`);
      },
      paginate: async ({ cursor, numItems }: { cursor: string | null; numItems: number }) => {
        const start = cursor === null ? 0 : Number(cursor);
        const ordered = descending ? [...matches].reverse() : matches;
        const page = ordered.slice(start, start + numItems);
        const next = start + page.length;
        return {
          page,
          isDone: next >= ordered.length,
          continueCursor: next >= ordered.length ? '' : String(next),
        };
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

const ORG = 'organizations:one';
const OTHER_ORG = 'organizations:other';
const LEADER = 'accounts:leader';
const SYSADMIN = 'accounts:sysadmin';
const TEACHER_ACCOUNT = 'accounts:teacher';
const TEACHER = 'teacher_profiles:teacher';
const NOW = Date.parse('2026-11-01T00:00:00.000Z');
const NOW_ISO = new Date(NOW).toISOString();

function seedOrganization(db: MemoryDb, organizationId = ORG) {
  db.seed('organizations', organizationId, {
    slug: organizationId,
    name: organizationId,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

function seedAccount(
  db: MemoryDb,
  accountId: string,
  displayName: string,
  organizationId = ORG,
) {
  db.seed('accounts', accountId, {
    organizationId,
    username: accountId,
    displayName,
    sharedSessionRole: 'admin',
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

function seedTeacher(
  db: MemoryDb,
  teacherProfileId: string,
  accountId: string,
  displayName: string,
  organizationId = ORG,
) {
  seedAccount(db, accountId, displayName, organizationId);
  db.seed('teacher_profiles', teacherProfileId, {
    organizationId,
    accountId,
    currentGbfAssignmentId: null,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

function seedRole(db: MemoryDb, accountId: string, role: string, organizationId = ORG) {
  db.seed('role_assignments', `role_assignments:${accountId}:${role}`, {
    organizationId,
    accountId,
    role,
    status: 'active',
    createdByAccountId: accountId,
    createdAt: NOW,
  });
}

function seedBase(db: MemoryDb) {
  seedOrganization(db);
  seedOrganization(db, OTHER_ORG);
  seedAccount(db, LEADER, 'Leader One');
  seedAccount(db, SYSADMIN, 'System Administrator');
  seedTeacher(db, TEACHER, TEACHER_ACCOUNT, 'Teacher One');
  seedRole(db, LEADER, 'school_head');
  seedRole(db, SYSADMIN, 'sysadmin');
  seedRole(db, TEACHER_ACCOUNT, 'teacher');
}

function priority(input: {
  teacherProfileId?: string;
  skillId?: string;
  componentId?: string;
  rating?: 1 | 2 | 3 | 4 | null;
  due?: boolean;
  dueAt?: string | null;
  overdueDays?: number;
} = {}) {
  const rating = input.rating === undefined ? 3 : input.rating;
  const points = rating === null ? null : { 1: 70, 2: 80, 3: 90, 4: 100 }[rating];
  return {
    teacherId: input.teacherProfileId ?? TEACHER,
    skillId: input.skillId ?? 'danielson.tlac.skill.double-plan',
    componentId: input.componentId ?? 'danielson.framework.component.1e',
    due: input.due ?? false,
    dueAt: input.dueAt ?? '2027-01-01T00:00:00.000Z',
    overdueDays: input.overdueDays ?? 0,
    currentProficiency: {
      rawRating: rating,
      points,
      passes: rating !== null && rating >= 3,
    },
    evidenceGaps: rating === null ? ['no_valid_rated_evidence'] : [],
    approvedPriorityInputs: [
      'due_status',
      'overdue_duration',
      'current_proficiency',
      'evidence_gap',
    ],
  };
}

function seedAttention(db: MemoryDb, teacherProfileId = TEACHER, targets = [priority()]) {
  db.seed('teacher_attention_summaries', `teacher_attention_summaries:${teacherProfileId}`, {
    organizationId: ORG,
    teacherProfileId,
    targets,
    updatedAt: NOW,
  });
}

const DANIELSON_GRAPH = buildDanielsonGraph().graph;
const COMPONENT_BY_SKILL = new Map(DANIELSON_GRAPH.edges
  .filter((edge) => edge.type === 'contains')
  .map((edge) => [edge.targetId, edge.sourceId]));
const ASSIGNED_GBF_SKILL_IDS = [...new Set(
  GBF_MAPPINGS.map((mapping) => mapping.skillId),
)];
const UNSEQUENCED_GBF_SKILL_IDS = DANIELSON_GRAPH.nodes
  .filter((node) => (
    node.kind === 'skill'
    && !ASSIGNED_GBF_SKILL_IDS.includes(node.id)
  ))
  .map((node) => node.id)
  .sort();

function primarySkillIds(trajectory: 'management' | 'rigor') {
  return GBF_ACTION_STEPS
    .filter((step) => step.status === 'required' && step.trajectory === trajectory)
    .map((step) => GBF_MAPPINGS.find((mapping) => (
      mapping.actionStepId === step.actionStepId && mapping.role === 'primary'
    ))?.skillId)
    .filter((skillId): skillId is string => skillId !== undefined);
}

function seedGbfAssignment(
  db: MemoryDb,
  input: { assignedAt?: number; suffix?: string } = {},
) {
  const assignmentId = `teacher_gbf_assignments:${input.suffix ?? 'one'}`;
  db.seed('teacher_gbf_assignments', assignmentId, {
    organizationId: ORG,
    teacherProfileId: TEACHER,
    assignedSkillIds: ASSIGNED_GBF_SKILL_IDS,
    unsequencedGapSkillIds: UNSEQUENCED_GBF_SKILL_IDS,
    actorAccountId: LEADER,
    assignedAt: input.assignedAt ?? NOW,
  });
  const teacher = db.rows('teacher_profiles').find((row) => row._id === TEACHER);
  if (teacher) teacher.currentGbfAssignmentId = assignmentId;
}

function seedGbfProficiency(db: MemoryDb, skillId: string, rating: 1 | 2 | 3 | 4) {
  const componentId = COMPONENT_BY_SKILL.get(skillId);
  if (!componentId) throw new Error(`Missing component for ${skillId}`);
  db.seed('teacher_proficiency', `teacher_proficiency:${skillId}`, {
    organizationId: ORG,
    teacherId: TEACHER,
    skillId,
    projection: {
      skillId,
      componentId,
      rawRating: rating,
      points: { 1: 70, 2: 80, 3: 90, 4: 100 }[rating],
      passes: rating >= 3,
      srsRating: rating === 1 ? 'Again' : rating === 2 ? 'Hard' : rating === 3 ? 'Good' : 'Easy',
      idempotencyKey: `evidence:${skillId}`,
      sourceRecordId: `observation:${skillId}`,
      provenanceGroupId: `provenance:${skillId}`,
      sourceType: 'walkthrough',
      occurredAt: NOW_ISO,
    },
    updatedAt: NOW,
  });
}

function seedSubmittedObservation(db: MemoryDb, input: {
  observationId?: string;
  teacherProfileId?: string;
  teacherAccountId?: string;
  observationType?: 'walkthrough' | 'formal_q1' | 'formal_q4';
  submittedAt?: number;
} = {}) {
  const observationId = input.observationId ?? 'observation_records:one';
  const teacherProfileId = input.teacherProfileId ?? TEACHER;
  db.seed('observation_records', observationId, {
    organizationId: ORG,
    teacherProfileId,
    observerAccountId: LEADER,
    observationType: input.observationType ?? 'walkthrough',
    schoolYear: '2026-2027',
    sourceVersion: 'danielson-observation.v1',
    frameworkVersion: 'danielson-2022',
    observedAt: '2026-10-01T00:00:00.000Z',
    status: 'submitted',
    revision: 1,
    items: [{
      itemId: 'danielson.tlac.skill.double-plan',
      skillId: 'danielson.tlac.skill.double-plan',
      componentId: 'danielson.framework.component.1e',
      priorityReason: 'due',
      outcome: { kind: 'rated', rating: 3 },
      evidenceNote: 'Teacher-visible note.',
    }],
    submissionKey: `${observationId}:submission`,
    submissionFingerprint: `${observationId}:fingerprint`,
    submittedAt: input.submittedAt ?? NOW,
    publishedAt: input.submittedAt ?? NOW,
    createdAt: NOW,
    updatedAt: NOW,
  });
  return observationId;
}

function seedFormalObservation(db: MemoryDb, input: {
  observationId: string;
  teacherProfileId?: string;
  observationType?: 'formal_q1' | 'formal_q4';
  schoolYear?: string;
  componentId?: string;
  componentIds?: string[];
  rating?: 1 | 2 | 3 | 4;
  status?: 'draft' | 'submitted';
  observedAt?: string;
  submittedAt?: number;
}) {
  const teacherProfileId = input.teacherProfileId ?? TEACHER;
  const observedAt = input.observedAt ?? '2026-10-01T00:00:00.000Z';
  const submittedAt = input.submittedAt ?? NOW;
  const componentId = input.componentId ?? 'danielson.framework.component.1e';
  const componentIds = input.componentIds ?? [componentId];
  const status = input.status ?? 'submitted';
  db.seed('observation_records', input.observationId, {
    organizationId: ORG,
    teacherProfileId,
    observerAccountId: LEADER,
    observationType: input.observationType ?? 'formal_q1',
    schoolYear: input.schoolYear ?? '2026-2027',
    sourceVersion: 'danielson-observation.v1',
    frameworkVersion: 'danielson-2022',
    observedAt,
    status,
    revision: 1,
    items: componentIds.map((itemComponentId) => ({
      itemId: `${input.observationId}:${itemComponentId}:item`,
      componentId: itemComponentId,
      outcome: { kind: 'rated', rating: input.rating ?? 3 },
      evidenceNote: null,
    })),
    ...(status === 'submitted'
      ? {
          submissionKey: `${input.observationId}:submission`,
          submissionFingerprint: `${input.observationId}:fingerprint`,
          submittedAt,
          publishedAt: submittedAt,
        }
      : {}),
    createdAt: submittedAt,
    updatedAt: submittedAt,
  });
  return input.observationId;
}

function seedFormalPortfolio(db: MemoryDb, teacherCount: number) {
  seedBase(db);
  for (let index = 0; index < teacherCount; index += 1) {
    const teacherProfileId = `teacher_profiles:formal-${index}`;
    seedTeacher(db, teacherProfileId, `accounts:formal-${index}`, `Formal Teacher ${index}`);
    seedFormalObservation(db, {
      observationId: `observation_records:formal-${index}:q1`,
      teacherProfileId,
      observationType: 'formal_q1',
    });
    seedFormalObservation(db, {
      observationId: `observation_records:formal-${index}:q4`,
      teacherProfileId,
      observationType: 'formal_q4',
    });
  }
}

function componentFromReport(
  report: Record<string, unknown>,
  componentId: string,
) {
  const currentProficiency = report.currentProficiency as {
    domains: Array<{ components: Array<{ componentId: string; state: string }> }>;
  };
  return currentProficiency.domains
    .flatMap((domain) => domain.components)
    .find((component) => component.componentId === componentId);
}

function scoringSnapshot(db: MemoryDb) {
  return structuredClone({
    observations: db.rows('observation_records'),
    amendments: db.rows('observation_amendments'),
    outcomes: db.rows('teacher_observation_outcomes'),
    proficiency: db.rows('teacher_proficiency'),
    cards: db.rows('teacher_srs_cards'),
    reviews: db.rows('teacher_srs_reviews'),
    knowledgeState: db.rows('teacher_knowledge_state'),
    priority: db.rows('teacher_priority'),
    summaries: db.rows('teacher_attention_summaries'),
  });
}

function expectAllowed<T extends Record<string, unknown>>(result: T) {
  expect(result).toMatchObject({ kind: 'allowed' });
  if (result.kind !== 'allowed') throw new Error('Expected allowed result');
  return result;
}

describe('Danielson reporting Convex boundary', () => {
  it('uses a constant formal-evidence query count as teacher count grows', async () => {
    async function readCounts(teacherCount: number) {
      const db = new MemoryDb();
      seedFormalPortfolio(db, teacherCount);
      await expect(handler(readLeadershipPortfolio)(db.context(), {
        actorAccountId: LEADER,
        now: NOW_ISO,
        cursor: null,
        pageSize: 25,
      })).resolves.toMatchObject({ kind: 'allowed' });
      return {
        observations: db.queryCalls.filter((call) => call.table === 'observation_records'),
        amendments: db.queryCalls.filter((call) => call.table === 'observation_amendments'),
      };
    }

    const oneTeacher = await readCounts(1);
    const manyTeachers = await readCounts(61);

    expect(oneTeacher.observations).toHaveLength(2);
    expect(oneTeacher.amendments).toHaveLength(1);
    expect(oneTeacher.observations.map((call) => call.index).sort()).toEqual([
      'by_organizationId_and_status_and_observationType_and_schoolYear',
      'by_organizationId_and_status_and_observationType_and_schoolYear',
    ]);
    expect(oneTeacher.amendments[0]?.index).toBe('by_org_teacher_occurred');
    expect(manyTeachers).toEqual(oneTeacher);
  });

  it('does not let newer drafts hide submitted formal evidence', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedAttention(db);
    seedFormalObservation(db, {
      observationId: 'observation_records:submitted-q1',
      observationType: 'formal_q1',
      componentIds: DANIELSON_GRAPH.nodes
        .filter((node) => node.kind === 'instructional_unit')
        .map((node) => node.id),
      rating: 3,
      observedAt: '2026-08-01T00:00:00.000Z',
    });
    for (let index = 0; index < 4; index += 1) {
      seedFormalObservation(db, {
        observationId: `observation_records:draft-q1-${index}`,
        observationType: 'formal_q1',
        componentId: 'danielson.framework.component.1b',
        status: 'draft',
        observedAt: `2026-10-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
      });
    }

    const portfolio = expectAllowed(await handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    }));
    const row = (portfolio.page as { items: Array<Record<string, unknown>> }).items
      .find((item) => item.teacherProfileId === TEACHER);
    expect(row?.danielson).toMatchObject({ state: 'proficient' });

    const report = expectAllowed(await handler(readLeadershipTeacherReport)(db.context(), {
      actorAccountId: LEADER,
      teacherProfileId: TEACHER,
      now: NOW_ISO,
    })).report as Record<string, unknown>;
    expect(componentFromReport(report, 'danielson.framework.component.1a')).toMatchObject({
      state: 'proficient',
    });
  });

  it('keeps rated evidence from older formal records until replacement', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedAttention(db);
    seedFormalObservation(db, {
      observationId: 'observation_records:oldest-q1',
      observationType: 'formal_q1',
      componentId: 'danielson.framework.component.1a',
      rating: 2,
      schoolYear: '2022-2023',
      observedAt: '2023-05-01T00:00:00.000Z',
    });
    for (let index = 0; index < 4; index += 1) {
      seedFormalObservation(db, {
        observationId: `observation_records:newer-q1-${index}`,
        observationType: 'formal_q1',
        componentId: `danielson.framework.component.${['1b', '1c', '1d', '1e'][index]}`,
        rating: 3,
        schoolYear: '2026-2027',
        observedAt: `2026-09-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
      });
    }

    const portfolio = expectAllowed(await handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    }));
    const row = (portfolio.page as { items: Array<Record<string, unknown>> }).items
      .find((item) => item.teacherProfileId === TEACHER);
    expect((row?.danielson as { belowComponentIds: string[] }).belowComponentIds)
      .toContain('danielson.framework.component.1a');

    const report = expectAllowed(await handler(readLeadershipTeacherReport)(db.context(), {
      actorAccountId: LEADER,
      teacherProfileId: TEACHER,
      now: NOW_ISO,
    })).report as Record<string, unknown>;
    expect(componentFromReport(report, 'danielson.framework.component.1a')).toMatchObject({
      state: 'below_proficient',
    });
  });

  it('applies database amendments to the portfolio and teacher report', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedAttention(db);
    const componentIds = DANIELSON_GRAPH.nodes
      .filter((node) => node.kind === 'instructional_unit')
      .map((node) => node.id);
    seedFormalObservation(db, {
      observationId: 'observation_records:amended-q1',
      observationType: 'formal_q1',
      componentIds,
      rating: 3,
    });
    const sourceRecordId = seedFormalObservation(db, {
      observationId: 'observation_records:amended-q4',
      observationType: 'formal_q4',
      componentId: 'danielson.framework.component.1a',
      rating: 2,
      observedAt: '2026-10-15T00:00:00.000Z',
    });
    db.seed('observation_amendments', 'observation_amendments:amended-q4:1', {
      organizationId: ORG,
      observationId: sourceRecordId,
      teacherProfileId: TEACHER,
      authorAccountId: LEADER,
      idempotencyKey: 'amended-q4:1',
      fingerprint: 'amended-q4:1:fingerprint',
      version: 1,
      reason: 'Correct the component rating.',
      changedItems: [{
        itemId: `${sourceRecordId}:danielson.framework.component.1a:item`,
        outcome: { kind: 'rated', rating: 4 },
      }],
      occurredAt: NOW + 1,
    });

    const portfolio = expectAllowed(await handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    }));
    const row = (portfolio.page as { items: Array<Record<string, unknown>> }).items
      .find((item) => item.teacherProfileId === TEACHER);
    expect(row?.danielson).toMatchObject({ state: 'proficient' });

    const report = expectAllowed(await handler(readLeadershipTeacherReport)(db.context(), {
      actorAccountId: LEADER,
      teacherProfileId: TEACHER,
      now: NOW_ISO,
    })).report as Record<string, unknown>;
    expect(componentFromReport(report, 'danielson.framework.component.1a')).toMatchObject({
      state: 'proficient',
    });
    const q4 = (report.officialEvaluations as Array<Record<string, unknown>>)
      .find((evaluation) => evaluation.observationType === 'formal_q4');
    expect(q4).toMatchObject({
      observationId: sourceRecordId,
      amendmentCount: 1,
      components: [{
        componentId: 'danielson.framework.component.1a',
        rawRating: 4,
        sourceObservationId: sourceRecordId,
      }],
    });
  });

  it('returns capacity without a partial portfolio when formal records exceed the limit', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedAttention(db);
    for (let index = 0; index < 2_001; index += 1) {
      seedFormalObservation(db, {
        observationId: `observation_records:formal-capacity-${index}`,
        observationType: 'formal_q1',
      });
    }

    await expect(handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    })).resolves.toEqual({ kind: 'portfolio_capacity_exceeded' });
  });

  it('returns capacity without a partial portfolio when amendments exceed the limit', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedAttention(db);
    const observationId = seedFormalObservation(db, {
      observationId: 'observation_records:amendment-capacity',
      observationType: 'formal_q1',
    });
    for (let index = 0; index < 2_001; index += 1) {
      db.seed('observation_amendments', `observation_amendments:capacity-${index}`, {
        organizationId: ORG,
        observationId,
        teacherProfileId: TEACHER,
        authorAccountId: LEADER,
        idempotencyKey: `capacity-${index}`,
        fingerprint: `capacity-${index}:fingerprint`,
        version: index + 1,
        reason: 'Capacity test.',
        changedItems: [],
        occurredAt: NOW + index,
      });
    }

    await expect(handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    })).resolves.toEqual({ kind: 'portfolio_capacity_exceeded' });
  });

  it('projects one compact GBF state from one organization assignment batch', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedGbfAssignment(db);
    const management = [...new Set(primarySkillIds('management'))];
    const rigorFirst = primarySkillIds('rigor')[0];
    expect(rigorFirst).toBeDefined();
    seedAttention(db, TEACHER, [
      ...management.map((skillId) => priority({
        skillId,
        componentId: COMPONENT_BY_SKILL.get(skillId),
        rating: 3,
      })),
      ...(rigorFirst ? [priority({
        skillId: rigorFirst,
        componentId: COMPONENT_BY_SKILL.get(rigorFirst),
        rating: 2,
        due: true,
        dueAt: NOW_ISO,
      })] : []),
    ]);

    const result = expectAllowed(await handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    }));
    const page = result.page as { items: Array<Record<string, unknown>> };
    const teacher = page.items.find((row) => row.teacherProfileId === TEACHER);

    expect(teacher).toMatchObject({
      gbf: {
        contractVersion: 'danielson.gbf-progress.v1',
        state: 'in_progress',
        managementPhaseId: 'complete',
        rigorPhaseId: 'phase_1',
      },
    });
    expect(Object.keys(teacher?.gbf as Record<string, unknown>).sort()).toEqual([
      'contractVersion',
      'dueSkillCount',
      'managementPhaseId',
      'rigorPhaseId',
      'state',
      'unresolvedGapSkillCount',
    ]);
    expect(db.queryCalls.filter((call) => call.table === 'teacher_profiles'))
      .toEqual([{
        table: 'teacher_profiles',
        index: 'by_organizationId_and_isActive',
        take: 251,
      }, {
        table: 'teacher_profiles',
        index: 'by_organizationId_and_isActive',
        take: 251,
      }]);
  });

  it('returns the same safe full GBF progress to the teacher and leadership', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedGbfAssignment(db);
    for (const skillId of new Set(primarySkillIds('management'))) {
      seedGbfProficiency(db, skillId, 3);
    }
    const rigorFirst = primarySkillIds('rigor')[0];
    expect(rigorFirst).toBeDefined();
    if (rigorFirst) seedGbfProficiency(db, rigorFirst, 2);

    const teacherResult = expectAllowed(await handler(readMyTeacherReport)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      now: NOW_ISO,
    }));
    const leadershipResult = expectAllowed(await handler(readLeadershipTeacherReport)(
      db.context(),
      {
        actorAccountId: LEADER,
        teacherProfileId: TEACHER,
        now: NOW_ISO,
      },
    ));
    const teacherReport = teacherResult.report as Record<string, unknown>;
    const leadershipReport = leadershipResult.report as Record<string, unknown>;
    const gbf = teacherReport.gbf as Record<string, unknown>;

    expect(leadershipReport.gbf).toEqual(gbf);
    expect(gbf).toMatchObject({
      contractVersion: 'danielson.gbf-progress.v1',
      state: 'in_progress',
      assignedSkillIds: expect.arrayContaining(['danielson.tlac.skill.double-plan']),
      unresolvedGapSkillIds: expect.arrayContaining([
        'danielson.tlac.skill.knowledge-organizers',
      ]),
      trajectories: {
        management: { currentPhaseId: 'complete' },
        rigor: { currentPhaseId: 'phase_1' },
      },
    });
    expect(JSON.stringify({ teacher: teacherReport.gbf, leadership: leadershipReport.gbf }))
      .not.toMatch(/PRIVATE-GBF-FINGERPRINT|actorAccountId|requestId|fingerprint/);
    expect(db.queryCalls.filter((call) => call.table === 'teacher_gbf_assignments'))
      .toEqual([]);
  });

  it('does not treat immutable assignment history as current portfolio capacity', async () => {
    const portfolioDb = new MemoryDb();
    seedBase(portfolioDb);
    for (let index = 0; index < 251; index += 1) {
      seedGbfAssignment(portfolioDb, {
        assignedAt: NOW + index,
        suffix: `portfolio-capacity:${index}`,
      });
    }
    const latestAssignment = portfolioDb.rows('teacher_gbf_assignments').at(-1);
    await portfolioDb.patch(TEACHER, {
      currentGbfAssignmentId: latestAssignment?._id,
    });
    await expect(handler(readLeadershipPortfolio)(portfolioDb.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    })).resolves.toMatchObject({ kind: 'allowed' });

    const teacherDb = new MemoryDb();
    seedBase(teacherDb);
    for (let index = 0; index < 101; index += 1) {
      seedGbfAssignment(teacherDb, {
        assignedAt: NOW + index,
        suffix: `teacher-capacity:${index}`,
      });
    }
    await expect(handler(readMyTeacherReport)(teacherDb.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      now: NOW_ISO,
    })).resolves.toMatchObject({ kind: 'allowed' });
  });

  it('paginates 61 compact portfolio rows and makes no database write', async () => {
    const db = new MemoryDb();
    seedBase(db);
    for (let index = 0; index < 61; index += 1) {
      const suffix = String(index).padStart(2, '0');
      const teacherProfileId = `teacher_profiles:${suffix}`;
      seedTeacher(db, teacherProfileId, `accounts:teacher-${suffix}`, `Teacher ${suffix}`);
      seedAttention(db, teacherProfileId, [priority({ teacherProfileId })]);
    }
    const before = db.snapshot();
    const read = handler(readLeadershipPortfolio);
    const first = expectAllowed(await read(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    }));
    const firstPage = first.page as {
      items: Array<Record<string, unknown>>;
      isDone: boolean;
      continueCursor: string;
    };
    const second = expectAllowed(await read(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: firstPage.continueCursor,
      pageSize: 25,
    }));
    const secondPage = second.page as typeof firstPage;
    const third = expectAllowed(await read(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: secondPage.continueCursor,
      pageSize: 25,
    }));
    const thirdPage = third.page as typeof firstPage;
    const rows = [...firstPage.items, ...secondPage.items, ...thirdPage.items];

    expect(firstPage.items).toHaveLength(25);
    expect(secondPage.items).toHaveLength(25);
    expect(thirdPage.items).toHaveLength(12);
    expect(new Set(rows.map((row) => row.teacherProfileId))).toHaveLength(62);
    expect(firstPage.items[0]).toMatchObject({
      teacherProfileId: expect.any(String),
      displayName: expect.any(String),
      danielson: expect.any(Object),
      improvementPlan: { state: 'not_configured' },
      gbf: { state: 'not_configured' },
      evidenceDue: expect.any(Object),
      attentionReasons: expect.any(Array),
    });
    expect(db.snapshot()).toEqual(before);
  });

  it('uses current HOD and coach scope without a report query for each teacher', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const scopedLeader = 'accounts:scoped-leader';
    seedAccount(db, scopedLeader, 'Scoped Leader');
    db.seed('departments', 'departments:math', {
      organizationId: ORG,
      key: 'math',
      name: 'Mathematics',
      isActive: true,
    });
    seedRole(db, scopedLeader, 'hod');
    seedRole(db, scopedLeader, 'coach');
    db.seed('hod_assignments', 'hod_assignments:leader-math', {
      organizationId: ORG,
      accountId: scopedLeader,
      departmentId: 'departments:math',
      status: 'active',
    });
    seedTeacher(db, 'teacher_profiles:hod', 'accounts:hod-teacher', 'HOD Teacher');
    seedTeacher(db, 'teacher_profiles:coach', 'accounts:coach-teacher', 'Coach Teacher');
    seedTeacher(db, 'teacher_profiles:outside', 'accounts:outside-teacher', 'Outside Teacher');
    db.seed('department_memberships', 'department_memberships:hod', {
      organizationId: ORG,
      departmentId: 'departments:math',
      teacherProfileId: 'teacher_profiles:hod',
      status: 'active',
    });
    db.seed('coach_assignments', 'coach_assignments:coach', {
      organizationId: ORG,
      accountId: scopedLeader,
      teacherProfileId: 'teacher_profiles:coach',
      status: 'active',
    });

    const result = expectAllowed(await handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: scopedLeader,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    }));
    const page = result.page as { items: Array<{ teacherProfileId: string }> };
    expect(page.items.map((row) => row.teacherProfileId)).toEqual(expect.arrayContaining([
      'teacher_profiles:hod',
      'teacher_profiles:coach',
    ]));
    expect(page.items.map((row) => row.teacherProfileId)).not.toContain('teacher_profiles:outside');
  });

  it('denies sysadmin-only access and permits the same account through an added SLT role', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const read = handler(readLeadershipPortfolio);

    await expect(read(db.context(), {
      actorAccountId: SYSADMIN,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    })).resolves.toMatchObject({ kind: 'denied', reason: 'capability_not_granted' });

    seedRole(db, SYSADMIN, 'slt');
    await expect(read(db.context(), {
      actorAccountId: SYSADMIN,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    })).resolves.toMatchObject({ kind: 'allowed' });
  });

  it('returns a capacity result instead of truncating 251 active teachers', async () => {
    const db = new MemoryDb();
    seedBase(db);
    for (let index = 0; index < 251; index += 1) {
      seedTeacher(
        db,
        `teacher_profiles:capacity-${index}`,
        `accounts:capacity-${index}`,
        `Capacity Teacher ${index}`,
      );
    }

    await expect(handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    })).resolves.toEqual({ kind: 'portfolio_capacity_exceeded' });
  });

  it('keeps sentinel private data out of teacher, portfolio, and self-leadership shapes', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedRole(db, TEACHER_ACCOUNT, 'slt');
    const observationId = seedSubmittedObservation(db);
    db.seed('observation_public_comments', 'observation_public_comments:one', {
      organizationId: ORG,
      observationId,
      teacherProfileId: TEACHER,
      authorAccountId: LEADER,
      content: 'Public comment sentinel.',
      createdAt: NOW,
    });
    db.seed('observation_private_comments', 'observation_private_comments:one', {
      organizationId: ORG,
      observationId,
      teacherProfileId: TEACHER,
      authorAccountId: LEADER,
      content: 'PRIVATE-TEXT-SENTINEL',
      createdAt: NOW,
    });
    const teacher = expectAllowed(await handler(readMyTeacherReport)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      now: NOW_ISO,
    }));
    const portfolio = expectAllowed(await handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    }));
    const selfLeadership = expectAllowed(await handler(readLeadershipTeacherReport)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      teacherProfileId: TEACHER,
      now: NOW_ISO,
    }));

    for (const result of [teacher, portfolio, selfLeadership]) {
      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain('PRIVATE-TEXT-SENTINEL');
      expect(serialized).not.toContain('privateComments');
      expect(serialized).not.toContain('privateCommentCount');
      expect(serialized).not.toContain('hasPrivateComment');
    }
    await expect(handler(listLeadershipPrivateComments)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      teacherProfileId: TEACHER,
      paginationOpts: { cursor: null, numItems: 20 },
    })).resolves.toMatchObject({ kind: 'denied', reason: 'self_private_denied' });
  });

  it('returns private comments only to an authorized leader in current scope', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const observationId = seedSubmittedObservation(db);
    db.seed('observation_public_comments', 'observation_public_comments:one', {
      organizationId: ORG,
      observationId,
      teacherProfileId: TEACHER,
      authorAccountId: LEADER,
      content: 'Public comment.',
      createdAt: NOW,
    });
    db.seed('observation_private_comments', 'observation_private_comments:one', {
      organizationId: ORG,
      observationId,
      teacherProfileId: TEACHER,
      authorAccountId: LEADER,
      content: 'Private comment.',
      createdAt: NOW,
    });

    const publicResult = expectAllowed(await handler(listLeadershipPublicComments)(db.context(), {
      actorAccountId: LEADER,
      teacherProfileId: TEACHER,
      paginationOpts: { cursor: null, numItems: 20 },
    }));
    const privateResult = expectAllowed(await handler(listLeadershipPrivateComments)(db.context(), {
      actorAccountId: LEADER,
      teacherProfileId: TEACHER,
      paginationOpts: { cursor: null, numItems: 20 },
    }));
    const teacherPublic = expectAllowed(await handler(listMyPublicComments)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      paginationOpts: { cursor: null, numItems: 20 },
    }));

    expect(JSON.stringify(publicResult)).toContain('Public comment.');
    expect(JSON.stringify(publicResult)).not.toContain('Private comment.');
    expect(JSON.stringify(privateResult)).toContain('Private comment.');
    expect(JSON.stringify(teacherPublic)).toContain('Public comment.');
    expect(JSON.stringify(teacherPublic)).not.toContain('Private comment.');

    const outsideLeader = 'accounts:outside-leader';
    seedAccount(db, outsideLeader, 'Outside Leader', OTHER_ORG);
    seedRole(db, outsideLeader, 'slt', OTHER_ORG);
    await expect(handler(listLeadershipPrivateComments)(db.context(), {
      actorAccountId: outsideLeader,
      teacherProfileId: TEACHER,
      paginationOpts: { cursor: null, numItems: 20 },
    })).resolves.toMatchObject({ kind: 'denied', reason: 'cross_organization' });
  });

  it('stores public and private comments separately without changing scoring or order', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedAttention(db);
    const observationId = seedSubmittedObservation(db);
    const scoringBefore = scoringSnapshot(db);
    const portfolioBefore = await handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    });

    await expect(handler(addPublicObservationComment)(db.context(), {
      actorAccountId: LEADER,
      observationId,
      content: ' Teacher-visible comment. ',
      now: NOW,
    })).resolves.toMatchObject({ kind: 'created' });
    await expect(handler(addPrivateObservationComment)(db.context(), {
      actorAccountId: LEADER,
      observationId,
      content: ' Leadership-only comment. ',
      now: NOW + 1,
    })).resolves.toMatchObject({ kind: 'created' });

    expect(db.rows('observation_public_comments')).toHaveLength(1);
    expect(db.rows('observation_public_comments')[0]).toMatchObject({
      content: 'Teacher-visible comment.',
      authorAccountId: LEADER,
      teacherProfileId: TEACHER,
    });
    expect(db.rows('observation_private_comments')).toHaveLength(1);
    expect(db.rows('observation_private_comments')[0]).toMatchObject({
      content: 'Leadership-only comment.',
      authorAccountId: LEADER,
      teacherProfileId: TEACHER,
    });
    expect(scoringSnapshot(db)).toEqual(scoringBefore);
    await expect(handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    })).resolves.toEqual(portfolioBefore);
  });

  it('rejects invalid, self-subject, and sysadmin-only comment writes before insert', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedRole(db, TEACHER_ACCOUNT, 'slt');
    const observationId = seedSubmittedObservation(db);

    await expect(handler(addPublicObservationComment)(db.context(), {
      actorAccountId: LEADER,
      observationId,
      content: ' '.repeat(5),
      now: NOW,
    })).resolves.toMatchObject({ kind: 'invalid_comment' });
    await expect(handler(addPublicObservationComment)(db.context(), {
      actorAccountId: LEADER,
      observationId,
      content: 'x'.repeat(4_001),
      now: NOW,
    })).resolves.toMatchObject({ kind: 'invalid_comment' });
    await expect(handler(addPrivateObservationComment)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      observationId,
      content: 'Self comment.',
      now: NOW,
    })).resolves.toMatchObject({ kind: 'denied', reason: 'self_evaluation_denied' });
    await expect(handler(addPrivateObservationComment)(db.context(), {
      actorAccountId: SYSADMIN,
      observationId,
      content: 'Sysadmin comment.',
      now: NOW,
    })).resolves.toMatchObject({ kind: 'denied', reason: 'capability_not_granted' });
    expect(db.rows('observation_public_comments')).toEqual([]);
    expect(db.rows('observation_private_comments')).toEqual([]);
  });

  it('keeps the first teacher response final and makes no scoring write', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const observationId = seedSubmittedObservation(db);
    const before = scoringSnapshot(db);
    const submit = handler(submitTeacherResponse);
    const first = await submit(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      observationId,
      content: ' My final response. ',
      now: NOW,
    });
    const second = await submit(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      observationId,
      content: 'Replacement response.',
      now: NOW + 1,
    });

    expect(first).toMatchObject({ kind: 'submitted' });
    expect(second).toEqual({ kind: 'response_exists' });
    expect(db.rows('teacher_observation_responses')).toHaveLength(1);
    expect(db.rows('teacher_observation_responses')[0]).toMatchObject({
      observationId,
      teacherProfileId: TEACHER,
      authorAccountId: TEACHER_ACCOUNT,
      content: 'My final response.',
    });
    expect(scoringSnapshot(db)).toEqual(before);

    const teacherReport = expectAllowed(await handler(readMyTeacherReport)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      now: NOW_ISO,
    }));
    const leaderReport = expectAllowed(await handler(readLeadershipTeacherReport)(db.context(), {
      actorAccountId: LEADER,
      teacherProfileId: TEACHER,
      now: NOW_ISO,
    }));
    expect(JSON.stringify(teacherReport)).toContain('My final response.');
    expect(JSON.stringify(leaderReport)).toContain('My final response.');
  });

  it('rejects a second-person response, empty response, and response to a draft', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const observationId = seedSubmittedObservation(db);
    const draftId = 'observation_records:draft';
    db.seed('observation_records', draftId, {
      ...db.rows('observation_records')[0],
      status: 'draft',
      submissionKey: undefined,
      submittedAt: undefined,
      publishedAt: undefined,
    });
    const submit = handler(submitTeacherResponse);

    await expect(submit(db.context(), {
      actorAccountId: LEADER,
      observationId,
      content: 'Leader reply.',
      now: NOW,
    })).resolves.toMatchObject({ kind: 'denied' });
    await expect(submit(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      observationId,
      content: '',
      now: NOW,
    })).resolves.toEqual({ kind: 'invalid_response' });
    await expect(submit(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      observationId: draftId,
      content: 'Response to draft.',
      now: NOW,
    })).resolves.toEqual({ kind: 'not_found' });
    expect(db.rows('teacher_observation_responses')).toEqual([]);
  });
});
