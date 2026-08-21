import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps, ComponentType } from 'react';
import { describe, expect, it } from 'vitest';

import * as reportingFunctions from '../../convex/reporting';
import { ReportCommentForm } from '../../components/report-comment-form';
import { TeacherReportView } from '../../components/teacher-report-view';
import type { PrivateTeacherReport } from '../../lib/reporting/contracts';

type StoredDocument = Record<string, unknown> & { _id: string; _creationTime: number };
type Handler<TArgs = Record<string, unknown>, TResult = Record<string, unknown>> = (
  ctx: { db: MemoryDb },
  args: TArgs,
) => Promise<TResult>;

class RetryConflict extends Error {}

class MemoryDb {
  private sequence = 0;
  private readonly tables = new Map<string, Map<string, StoredDocument>>();
  private responseReaders = 0;
  private responseReadsReleased = false;
  private releaseResponseReads: (() => void) | null = null;
  private readonly responseReadGate = new Promise<void>((resolveGate) => {
    this.releaseResponseReads = resolveGate;
  });

  constructor(private readonly interleaveResponseReads = false) {}

  seed(table: string, id: string, document: Record<string, unknown>) {
    this.table(table).set(id, { _id: id, _creationTime: ++this.sequence, ...document });
  }

  rows(table: string): StoredDocument[] {
    return [...this.table(table).values()];
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
    return this.table(table).has(id) ? id : null;
  }

  async insert(table: string, document: Record<string, unknown>) {
    if (this.interleaveResponseReads && table === 'teacher_observation_responses') {
      const duplicate = this.rows(table).some((row) => (
        row.organizationId === document.organizationId
        && row.observationId === document.observationId
      ));
      if (duplicate) throw new RetryConflict('indexed_read_conflict');
    }
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
      order: (direction: 'asc' | 'desc') => {
        descending = direction === 'desc';
        return query;
      },
      unique: async () => {
        if (this.interleaveResponseReads && tableName === 'teacher_observation_responses') {
          this.responseReaders += 1;
          if (this.responseReaders === 2) {
            this.responseReadsReleased = true;
            this.releaseResponseReads?.();
          }
          if (!this.responseReadsReleased) await this.responseReadGate;
        }
        if (matches.length > 1) throw new Error(`Expected one ${tableName} row`);
        return matches[0] ?? null;
      },
      first: async () => {
        const ordered = descending ? [...matches].reverse() : matches;
        return ordered[0] ?? null;
      },
      take: async (count: number) => {
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
const TEACHER_ACCOUNT = 'accounts:teacher';
const TEACHER = 'teacher_profiles:teacher';
const NOW = Date.parse('2026-11-01T00:00:00.000Z');
const NOW_ISO = new Date(NOW).toISOString();

function handler<TArgs = Record<string, unknown>, TResult = Record<string, unknown>>(
  value: unknown,
): Handler<TArgs, TResult> {
  return (value as { _handler: Handler<TArgs, TResult> })._handler;
}

function requiredHandler<TArgs = Record<string, unknown>, TResult = Record<string, unknown>>(
  name: string,
) {
  const value = (reportingFunctions as Record<string, unknown>)[name];
  expect(value, `${name} must exist`).toBeDefined();
  return handler<TArgs, TResult>(value);
}

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

function seedBase(db: MemoryDb) {
  seedOrganization(db);
  seedOrganization(db, OTHER_ORG);
  seedAccount(db, LEADER, 'Leader One');
  seedTeacher(db, TEACHER, TEACHER_ACCOUNT, 'Teacher One');
  seedRole(db, LEADER, 'school_head');
  seedRole(db, TEACHER_ACCOUNT, 'teacher');
}

function seedSubmittedObservation(db: MemoryDb, suffix: string) {
  const observationId = `observation_records:${suffix}`;
  db.seed('observation_records', observationId, {
    organizationId: ORG,
    teacherProfileId: TEACHER,
    observerAccountId: LEADER,
    observationType: 'walkthrough',
    schoolYear: '2026-2027',
    sourceVersion: 'danielson-observation.v1',
    frameworkVersion: 'danielson-2022',
    observedAt: new Date(NOW + Number(suffix.replace(/\D/g, '') || 0) * 1_000).toISOString(),
    status: 'submitted',
    revision: 1,
    items: [{
      itemId: 'danielson.tlac.skill.double-plan',
      skillId: 'danielson.tlac.skill.double-plan',
      componentId: 'danielson.framework.component.1e',
      priorityReason: 'due',
      outcome: { kind: 'rated', rating: 2 },
      evidenceNote: 'Original note.',
    }],
    submissionKey: `${observationId}:submission`,
    submissionFingerprint: `${observationId}:fingerprint`,
    submittedAt: NOW,
    publishedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  });
  return observationId;
}

type PageResult<T> = {
  kind: string;
  page: { page: T[]; isDone: boolean; continueCursor: string };
};

async function readAllPages<TArgs extends Record<string, unknown>, T>(
  read: Handler<TArgs & { paginationOpts: { cursor: string | null; numItems: number } }, PageResult<T>>,
  db: MemoryDb,
  args: TArgs,
) {
  const items: T[] = [];
  let cursor: string | null = null;
  for (let pageNumber = 0; pageNumber < 10; pageNumber += 1) {
    const result = await read(db.context(), {
      ...args,
      paginationOpts: { cursor, numItems: 20 },
    });
    expect(result.kind).toBe('allowed');
    items.push(...result.page.page);
    if (result.page.isDone) return items;
    cursor = result.page.continueCursor;
  }
  throw new Error('Pagination did not finish');
}

const report: PrivateTeacherReport = {
  teacherProfileId: TEACHER,
  displayName: 'Teacher One',
  danielsonState: 'not_enough_evidence',
  officialEvaluations: [],
  currentProficiency: {
    state: 'not_enough_evidence',
    domains: [{
      domainId: 'danielson.framework.domain.1',
      title: 'Domain 1: Planning and Preparation',
      state: 'not_enough_evidence',
      components: [{
        componentId: 'danielson.framework.component.1e',
        title: '1e: Planning Coherent Instruction',
        state: 'not_enough_evidence',
        skills: [{
          skillId: 'danielson.tlac.skill.double-plan',
          title: 'Double Plan',
          rawRating: 3,
          points: 90,
          state: 'proficient',
          due: true,
          dueAt: '2027-01-15T00:00:00.000Z',
          overdueDays: 0,
          sourceRecordId: 'observation_records:skill-source',
        }],
      }],
    }],
  },
  improvementPlan: { contractVersion: 'danielson.ip-progress.v1', state: 'not_configured' },
  gbf: { contractVersion: 'danielson.gbf-progress.v1', state: 'not_configured' },
  evidenceHistory: [],
  publicComments: [],
  privateComments: [],
  responses: [],
};

describe('reporting independent-review backend contracts', () => {
  it('paginates all evidence and comment history without a first-page cap', async () => {
    const db = new MemoryDb();
    seedBase(db);
    for (let index = 0; index < 61; index += 1) {
      const observationId = seedSubmittedObservation(db, String(index).padStart(2, '0'));
      for (const visibility of ['public', 'private'] as const) {
        db.seed(`observation_${visibility}_comments`, `${visibility}:${index}`, {
          organizationId: ORG,
          observationId,
          teacherProfileId: TEACHER,
          authorAccountId: LEADER,
          content: `${visibility} comment ${index}`,
          createdAt: NOW + index,
        });
      }
    }

    const evidence = await readAllPages(
      requiredHandler<
        {
          actorAccountId: string;
          teacherProfileId: string;
          paginationOpts: { cursor: string | null; numItems: number };
        },
        PageResult<Record<string, unknown>>
      >('listLeadershipEvidenceHistory'),
      db,
      { actorAccountId: LEADER, teacherProfileId: TEACHER },
    );
    const publicComments = await readAllPages(
      handler<
        {
          actorAccountId: string;
          teacherProfileId: string;
          paginationOpts: { cursor: string | null; numItems: number };
        },
        PageResult<Record<string, unknown>>
      >(reportingFunctions.listLeadershipPublicComments),
      db,
      { actorAccountId: LEADER, teacherProfileId: TEACHER },
    );
    const privateComments = await readAllPages(
      handler<
        {
          actorAccountId: string;
          teacherProfileId: string;
          paginationOpts: { cursor: string | null; numItems: number };
        },
        PageResult<Record<string, unknown>>
      >(reportingFunctions.listLeadershipPrivateComments),
      db,
      { actorAccountId: LEADER, teacherProfileId: TEACHER },
    );

    expect(evidence).toHaveLength(61);
    expect(new Set(evidence.map((item) => (item as { observationId: string }).observationId)))
      .toHaveLength(61);
    expect(publicComments).toHaveLength(61);
    expect(privateComments).toHaveLength(61);
    expect((reportingFunctions as Record<string, unknown>).listMyEvidenceHistory)
      .toBeDefined();
  });

  it('applies effective amendments to evidence-history items', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const observationId = seedSubmittedObservation(db, 'amended');
    db.seed('observation_amendments', 'observation_amendments:amended:1', {
      organizationId: ORG,
      observationId,
      teacherProfileId: TEACHER,
      authorAccountId: LEADER,
      idempotencyKey: 'amended-history-1',
      fingerprint: 'amended-history-fingerprint',
      version: 1,
      reason: 'Correct the published record.',
      changedItems: [{
        itemId: 'danielson.tlac.skill.double-plan',
        outcome: { kind: 'rated', rating: 4 },
        evidenceNote: 'Effective amended note.',
      }],
      occurredAt: NOW + 1,
    });

    const items = await readAllPages(
      requiredHandler('listLeadershipEvidenceHistory'),
      db,
      { actorAccountId: LEADER, teacherProfileId: TEACHER },
    ) as Array<{ items: Array<Record<string, unknown>> }>;

    expect(items[0].items[0]).toMatchObject({
      outcome: { kind: 'rated', rating: 4 },
      evidenceNote: 'Effective amended note.',
    });
  });

  it('keeps one response after truly interleaved empty indexed reads', async () => {
    const db = new MemoryDb(true);
    seedBase(db);
    const observationId = seedSubmittedObservation(db, 'concurrent');
    const submit = handler(reportingFunctions.submitTeacherResponse);
    const runWithRetry = async (content: string, now: number) => {
      try {
        return await submit(db.context(), {
          actorAccountId: TEACHER_ACCOUNT,
          observationId,
          content,
          now,
        });
      } catch (error) {
        if (!(error instanceof RetryConflict)) throw error;
        return submit(db.context(), {
          actorAccountId: TEACHER_ACCOUNT,
          observationId,
          content,
          now,
        });
      }
    };

    const results = await Promise.all([
      runWithRetry('First concurrent response.', NOW),
      runWithRetry('Second concurrent response.', NOW + 1),
    ]);

    expect(results.map((result) => result.kind).sort())
      .toEqual(['response_exists', 'submitted']);
    expect(db.rows('teacher_observation_responses')).toHaveLength(1);
  });

  it.each([
    { role: 'hod', organizationWide: false },
    { role: 'coach', organizationWide: false },
    { role: 'school_head', organizationWide: true },
    { role: 'slt', organizationWide: true },
  ])('applies the current $role teacher scope', async ({ role, organizationWide }) => {
    const db = new MemoryDb();
    seedOrganization(db);
    seedOrganization(db, OTHER_ORG);
    seedAccount(db, LEADER, 'Scoped Leader');
    seedRole(db, LEADER, role);
    seedTeacher(db, 'teacher_profiles:inside', 'accounts:inside', 'Inside Teacher');
    seedTeacher(
      db,
      'teacher_profiles:outside',
      'accounts:outside',
      'Outside Teacher',
      organizationWide ? OTHER_ORG : ORG,
    );
    if (role === 'hod') {
      db.seed('departments', 'departments:math', {
        organizationId: ORG,
        key: 'math',
        name: 'Mathematics',
        isActive: true,
      });
      db.seed('hod_assignments', 'hod_assignments:leader-math', {
        organizationId: ORG,
        accountId: LEADER,
        departmentId: 'departments:math',
        status: 'active',
      });
      db.seed('department_memberships', 'department_memberships:inside', {
        organizationId: ORG,
        departmentId: 'departments:math',
        teacherProfileId: 'teacher_profiles:inside',
        status: 'active',
      });
    }
    if (role === 'coach') {
      db.seed('coach_assignments', 'coach_assignments:inside', {
        organizationId: ORG,
        accountId: LEADER,
        teacherProfileId: 'teacher_profiles:inside',
        status: 'active',
      });
    }

    const result = await handler(reportingFunctions.readLeadershipPortfolio)(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    }) as { kind: string; page: { items: Array<{ teacherProfileId: string }> } };

    expect(result.kind).toBe('allowed');
    expect(result.page.items.map((item) => item.teacherProfileId))
      .toEqual(['teacher_profiles:inside']);
  });
});

describe('reporting independent-review interface contracts', () => {
  it('renders the same graph before the detailed proficiency list for teacher and leadership reports', () => {
    const { privateComments: _privateComments, ...publicReport } = report;
    render(<TeacherReportView report={publicReport} canComment={false} canRespond={false} />);

    expect(screen.getByRole('img', { name: /teacher proficiency graph/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Current proficiency' })).toBeInTheDocument();

    const firstGraph = screen.getByRole('img', { name: /teacher proficiency graph/i });
    const currentHeading = screen.getByRole('heading', { name: 'Current proficiency' });
    expect(firstGraph.compareDocumentPosition(currentHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    render(<TeacherReportView report={report} canComment={false} canRespond={false} />);
    expect(screen.getAllByRole('img', { name: /teacher proficiency graph/i })).toHaveLength(2);
  });

  it('keeps private leadership comments outside the graph view', () => {
    const privateComment = 'private leadership comment sentinel';
    render(<TeacherReportView
      report={{
        ...report,
        privateComments: [{
          commentId: 'comment:private',
          observationId: 'observation_records:private',
          teacherProfileId: TEACHER,
          authorAccountId: LEADER,
          content: privateComment,
          createdAt: NOW,
        }],
      }}
      canComment={false}
      canRespond={false}
    />);

    expect(screen.getByText(privateComment)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /teacher proficiency graph/i })).not.toHaveTextContent(privateComment);
  });

  it('keeps self-view reports free of private-comment data', () => {
    const { privateComments: _privateComments, ...publicReport } = report;
    render(<TeacherReportView report={publicReport} canComment={false} canRespond={false} />);

    expect(screen.queryByRole('heading', { name: 'Private leadership comments' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /teacher proficiency graph/i })).toBeInTheDocument();
  });

  it('keeps every comment label and field ID unique across observations', () => {
    const { container } = render(<>
      {['one', 'two', 'three'].flatMap((suffix) => (
        (['public', 'private'] as const).map((commentType) => (
          <ReportCommentForm
            key={`${suffix}-${commentType}`}
            observationId={`observation_records:${suffix}`}
            commentType={commentType}
          />
        ))
      ))}
    </>);
    const fields = [...container.querySelectorAll('textarea')];
    const labels = [...container.querySelectorAll('label')];
    const ids = fields.map((field) => field.id);

    expect(fields).toHaveLength(6);
    expect(new Set(ids)).toHaveLength(6);
    expect(labels.map((label) => label.htmlFor)).toEqual(ids);
  });

  it('shows each skill with its parent, due date, and source record', () => {
    render(<TeacherReportView
      report={report}
      canComment={false}
      canRespond={false}
    />);
    fireEvent.click(screen.getByText(/Domain 1: Planning and Preparation/));

    expect(screen.getByText('1e: Planning Coherent Instruction')).toBeVisible();
    expect(screen.getByText(/Double Plan/)).toBeVisible();
    expect(screen.getByText(/Due on .*2027/i)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Open skill evidence source' }))
      .toHaveAttribute(
        'href',
        '/observations/records/observation_records%3Askill-source',
      );
  });

  it('shows the target skill and parent component in evidence history', () => {
    render(<TeacherReportView
      report={{
        ...report,
        evidenceHistory: [{
          observationId: 'observation_records:history',
          observationType: 'walkthrough',
          schoolYear: '2026-2027',
          observedAt: NOW_ISO,
          observerDisplayName: 'Observer One',
          amendmentCount: 0,
          teacherResponseState: 'not_submitted',
          items: [{
            itemId: 'history-item',
            componentId: 'danielson.framework.component.1e',
            skillId: 'danielson.tlac.skill.double-plan',
            outcome: { kind: 'rated', rating: 3 },
            evidenceNote: null,
          }],
        }],
      }}
      canComment={false}
      canRespond={false}
    />);

    fireEvent.click(screen.getByText(/walkthrough/));
    expect(screen.getByText('danielson.tlac.skill.double-plan')).toBeVisible();
    expect(screen.getByText(
      'Parent component: danielson.framework.component.1e',
    )).toBeVisible();
  });

  it('renders continuation links for evidence and public and private comments', () => {
    type PaginatedViewProps = ComponentProps<typeof TeacherReportView> & {
      evidenceHistoryNextHref: string | null;
      publicCommentsNextHref: string | null;
      privateCommentsNextHref: string | null;
    };
    const PaginatedTeacherReportView = TeacherReportView as ComponentType<PaginatedViewProps>;
    render(<PaginatedTeacherReportView
      report={report}
      canComment
      canRespond={false}
      evidenceHistoryNextHref="/reports/teacher?historyCursor=history-next"
      publicCommentsNextHref="/reports/teacher?publicCommentCursor=public-next"
      privateCommentsNextHref="/reports/teacher?privateCommentCursor=private-next"
    />);

    expect(screen.getByRole('link', { name: 'Next evidence page' }))
      .toHaveAttribute('href', '/reports/teacher?historyCursor=history-next');
    expect(screen.getByRole('link', { name: 'Next public comments page' }))
      .toHaveAttribute('href', '/reports/teacher?publicCommentCursor=public-next');
    expect(screen.getByRole('link', { name: 'Next private comments page' }))
      .toHaveAttribute('href', '/reports/teacher?privateCommentCursor=private-next');
  });
});
