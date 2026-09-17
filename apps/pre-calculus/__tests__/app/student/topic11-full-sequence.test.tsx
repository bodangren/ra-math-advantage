import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const NODE =
  "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs";
const SOURCE = `${NODE}.worked_example`;
vi.mock("@/curriculum/skill-graph/nodes.json", async (importOriginal) => {
  const original = await importOriginal<{
    default: { nodes: Array<Record<string, unknown>> };
  }>();
  return {
    default: {
      nodes: original.default.nodes.map((node) =>
        node.id === 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs' ? { ...node, reviewStatus: "approved" } : node,
      ),
    },
  };
});
vi.mock("@/curriculum/skill-graph/blueprints.json", async (importOriginal) => {
  const original = await importOriginal<{
    default: { blueprints: Array<Record<string, unknown>> };
  }>();
  return {
    default: {
      blueprints: original.default.blueprints.map((row) =>
        row.nodeId === 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs' ? { ...row, reviewStatus: "approved" } : row,
      ),
    },
  };
});
const state = vi.hoisted(() => ({ ctx: null as any }));
vi.mock("@/lib/auth/server", () => ({
  requireStudentSessionClaims: vi.fn().mockResolvedValue({ sub: "student", role: "student" }),
  requireStudentRequestClaims: vi.fn().mockResolvedValue({ sub: "student", role: "student" }),
  requireTeacherSessionClaims: vi.fn().mockResolvedValue({ sub: "teacher" }),
  requireTeacherRequestClaims: vi.fn().mockResolvedValue({ sub: "teacher" }),
}));
vi.mock("@/lib/convex/server", async () => {
  const activities = await import("@/convex/activities");
  const course = await import("@/convex/course");
  const teacher = await import("@/convex/learningEvidence");
  const evidence = await import("@/convex/selectedLearningEvidence");
  const invoke = (fn: unknown, args: unknown) => (fn as any)._handler(state.ctx, args);
  const queries: Record<string, (args: any) => Promise<any>> = {
    lesson: args => invoke(course.getLesson, args),
    worked: () => activities.getApprovedTopic11WorkedSourceHandler(state.ctx),
    delivery: args => activities.getTopic11LearnerDeliveryStateHandler(state.ctx, args),
    practice: () => activities.getApprovedPrecalculusPilotHandler(state.ctx),
    candidates: args => course.getTopic11TeacherCandidatesHandler(state.ctx, args),
    broad: async () => ({ standards: [], enrollments: [], classes: [], students: [], lessons: [], assignments: [] }),
  };
  const mutations: Record<string, (args: any) => Promise<any>> = {
    acknowledge: args => invoke(activities.createTopic11DailySubmission, args),
    create: args => invoke(activities.createServerOwnedSubmission, args),
    teacher: args => invoke(teacher.submitTopic11TeacherSubmission, args),
    evidence: args => evidence.submitRoutedEvidenceHandler(state.ctx, args),
  };
  return {
    internal: {
      course: { getLesson: 'lesson', getTeacherData: 'broad', getTopic11TeacherCandidates: 'candidates' },
      activities: { getApprovedTopic11WorkedSource: 'worked', getTopic11LearnerDeliveryState: 'delivery', getApprovedPrecalculusPilot: 'practice', createTopic11DailySubmission: 'acknowledge', createServerOwnedSubmission: 'create' },
      learningEvidence: { submitTopic11TeacherSubmission: 'teacher' },
      selectedLearningEvidence: { submitRouted: 'evidence' },
    },
    fetchInternalQuery: (ref: string, args: unknown) => queries[ref]!(args),
    fetchInternalMutation: (ref: string, args: unknown) => mutations[ref]!(args),
  };
});
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { POST } from "@/app/api/teacher/course/route";
import TeacherDashboard from "@/app/teacher/dashboard/page";
import LessonPage from "@/app/student/lessons/[topic]/page";
import { POST as acknowledgePOST } from "@/app/api/activities/precalculus-topic-1-1/submissions/route";
import { POST as createPOST } from "@/app/api/activities/precalculus-pilot/submissions/route";
import { POST as evidencePOST } from "@/app/api/learning-evidence/precalculus-pilot/route";

import { PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY } from "@/lib/learning-evidence/precalc-pilot";
function database() {
  const rows: Record<string, any[]> = {
    profiles: [
      {
        _id: "teacher",
        username: "teacher-name",
        role: "teacher",
        organizationId: "org",
      },
      {
        _id: "student",
        username: "student-name",
        displayName: "Student One",
        role: "student",
        organizationId: "org",
      },
    ],
    auth_credentials: [
      {
        _id: "teacher-credential",
        profileId: "teacher",
        username: "teacher-name",
        role: "teacher",
        organizationId: "org",
        isActive: true,
      },
      {
        _id: "student-credential",
        profileId: "student",
        username: "student-name",
        role: "student",
        organizationId: "org",
        isActive: true,
      },
    ],
    classes: [
      { _id: "class", teacherId: "teacher", name: "Period 1", archived: false },
    ],
    class_enrollments: [
      {
        _id: "enrollment",
        classId: "class",
        studentId: "student",
        status: "active",
        enrolledAt: 1,
      },
    ],
    lessons: [
      {
        _id: "lesson",
        unitNumber: 1,
        orderIndex: 1,
        title: "Change in Tandem",
      },
    ],
    class_lessons: [
      {
        _id: "assignment",
        classId: "class",
        lessonId: "lesson",
        assignedAt: 1,
      },
    ],
    lesson_versions: [
      {
        _id: "version",
        lessonId: "lesson",
        version: 1,
        status: "published",
        title: "Change in Tandem",
        createdAt: 1,
      },
    ],
    phase_versions: [
      {
        _id: "phase",
        lessonVersionId: "version",
        phaseNumber: 4,
        phaseType: "worked_example",
        title: "Worked example",
        createdAt: 1,
      },
    ],
    phase_sections: [
      {
        _id: "section",
        phaseVersionId: "phase",
        sequenceOrder: 2,
        sectionType: "activity",
        createdAt: 1,
        content: {
          activityId: "physical",
          componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
        },
      },
    ],
    activities: [
      {
        _id: "physical",
        stableActivityId: SOURCE,
        componentKey: PRECALCULUS_TOPIC_11_SOURCE_COMPONENT_KEY,
        displayName: "Topic 1.1: Identify Graph Intervals with Your Teacher",
        description:
          "Worked-example source activity for classifying increasing, decreasing, and constant intervals.",
        approval: { status: "approved", reviewedAt: 1 },
        createdAt: 1,
        props: { nodeId: NODE, mode: "worked_example", source: "teacher_led" },
        gradingConfig: { variantSeed: 0 },
      },
    ],
    lesson_responses: [],
    activity_submissions: [],
    learning_evidence: [],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
  };
  for (const mode of ['guided_practice', 'independent_practice']) rows.activities.push({
    _id: `physical-${mode}`, stableActivityId: `${NODE}.${mode}`,
    componentKey: 'precalculus-mastery-advantage-pilot',
    displayName: mode === 'guided_practice' ? 'Mastery Advantage: Identify Graph Intervals' : 'Independent Practice: Classify Graph Intervals',
    description: mode === 'guided_practice' ? 'Classify the increasing, decreasing, and constant intervals from a graph.' : 'Classify the increasing, decreasing, and constant intervals from a generated graph.',
    props: { nodeId: NODE, mode }, gradingConfig: { variantSeed: mode === 'guided_practice' ? 0 : 2 },
    approval: { status: 'approved', reviewedAt: 1 }, createdAt: 1,
  });
  // One test-local store supplies every actual query and writer in this sequence.
  const db: any = {
    get: async (...args: any[]) => Object.values(rows).flat().find(row => row._id === args.at(-1)) ?? null,
    insert: async (table: string, value: any) => {
      const id = `${table}:${rows[table].length + 1}`;
      rows[table].push({ _id: id, ...value }); return id;
    },
    patch: async (...args: any[]) => {
      const row = await db.get(args.at(-2)); if (!row) throw new Error('Missing row'); Object.assign(row, args.at(-1));
    },
    query: (table: string) => ({ withIndex: (index: string, configure: (query: any) => void) => {
      if (!rows[table]) throw new Error(`Unexpected table ${table}`);
      const predicates: Array<(row: any) => boolean> = [];
      const q: any = { eq: (field: string, value: unknown) => { predicates.push(row => row[field] === value); return q; }, lte: (field: string, value: number) => { predicates.push(row => typeof row[field] === 'number' && row[field] <= value); return q; } };
      configure(q);
      let direction = 1;
      const fields: Record<string,string> = { by_lesson_and_version: 'version', by_lesson_version_and_phase: 'phaseNumber', by_phase_version_and_sequence: 'sequenceOrder', by_user_and_activity: 'attemptOrdinal', by_learner_and_occurred_at: 'occurredAt' };
      const selected = () => rows[table].filter(row => predicates.every(predicate => predicate(row))).sort((a,b) => direction * ((a[fields[index] ?? '_creationTime'] ?? 0) - (b[fields[index] ?? '_creationTime'] ?? 0)));
      const result: any = {
        collect: async () => selected(), take: async (limit: number) => selected().slice(0, limit),
        unique: async () => { const found = selected(); if(found.length > 1) throw new Error('Duplicate row'); return found[0] ?? null; },
        first: async () => selected()[0] ?? null,
        order: (order: string) => { direction = order === 'desc' ? -1 : 1; return result; },
      };
      return result;
    } }),
  };
  return { ctx: { db }, rows };
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(Date, "now").mockReturnValue(10);
});


afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('connects the actual Worked, teacher confirmation, Guided, and Independent sequence', async () => {
  const {ctx, rows} = database(); state.ctx = ctx;
  const routes: Record<string, (request: Request) => Promise<Response>> = {
    '/api/activities/precalculus-topic-1-1/submissions': acknowledgePOST,
    '/api/teacher/course': POST,
    '/api/activities/precalculus-pilot/submissions': createPOST,
    '/api/learning-evidence/precalculus-pilot': evidencePOST,
  };
  vi.stubGlobal('fetch', (url: string, init: RequestInit) => {
    if (!routes[url]) throw new Error(`Unexpected route ${url}`);
    return routes[url](new Request(`http://test.local${url}`, init));
  });
  const lesson = () => LessonPage({ params: Promise.resolve({ topic: '1.1' }) });
  render(await lesson());
  expect(screen.queryByRole('heading', {name: /Guided Practice: Classify/})).not.toBeInTheDocument();
  expect(screen.queryByText('Your work and explanation')).not.toBeInTheDocument();
  // A direct premature request must not bypass the teacher-first boundary.
  const earlyAnswers = { increasingIntervals: '[0,3] U [7,9]', decreasingIntervals: '[3,7]', constantIntervals: 'none' };
  const earlyCreate = await createPOST(new Request('http://test.local/api/activities/precalculus-pilot/submissions', {
    method: 'POST', headers: { 'content-type': 'application/json', 'Idempotency-Key': 'premature-attempt' },
    body: JSON.stringify({ contractVersion: 'practice.v1', activityId: `${NODE}.guided_practice`, mode: 'guided_practice', status: 'submitted', attemptNumber: 1, submittedAt: new Date(Date.now()).toISOString(), answers: earlyAnswers, parts: Object.entries(earlyAnswers).map(([partId,rawAnswer]) => ({ partId, rawAnswer })) }),
  }));
  expect(earlyCreate.status).toBe(200);
  const earlyReceipt = await earlyCreate.json();
  const earlyEvidence = await evidencePOST(new Request('http://test.local/api/learning-evidence/precalculus-pilot', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({submissionId: earlyReceipt.submissionId}) }));
  expect(earlyEvidence.status).toBe(200);
  expect(await earlyEvidence.json()).toMatchObject({persisted: false, masteryApplied: false, kstApplied: false, decision: {reason: 'awaiting_teacher_exposure'}});
  expect(rows.learning_evidence).toHaveLength(0);
  expect(rows.learning_evidence_receipts).toHaveLength(0);
  expect(rows.srs_cards).toHaveLength(0);
  expect(rows.srs_review_log).toHaveLength(0);
  vi.mocked(Date.now).mockReturnValue(20);
  fireEvent.click(screen.getByRole('button', {name: 'Mark worked example reviewed'}));
  await waitFor(() => expect(rows.activity_submissions).toHaveLength(2));
  await waitFor(() => expect(screen.getByRole('button', {name: /reviewed/i})).toBeDisabled());
  const acknowledgement = rows.activity_submissions.find(row => row.stableActivityId === SOURCE)!;
  expect(acknowledgement).toMatchObject({ activityId: 'physical', stableActivityId: SOURCE });
  expect(rows.learning_evidence).toHaveLength(0);
  cleanup(); render(await lesson());
  expect(screen.getByText(/wait for your teacher/i)).toBeInTheDocument();
  expect(screen.queryByRole('heading', {name: /Guided Practice: Classify/})).not.toBeInTheDocument();
  expect(screen.queryByText('Your work and explanation')).not.toBeInTheDocument();
  cleanup(); render(await TeacherDashboard());
  vi.mocked(Date.now).mockReturnValue(30);
  fireEvent.click(screen.getByRole('button', {name: 'Confirm classroom introduction'}));
  await waitFor(() => expect(screen.getByText('Classroom introduction confirmed.')).toBeInTheDocument());
  expect(rows.learning_evidence).toHaveLength(1);
  expect(rows.learning_evidence[0]).toMatchObject({nodeId: NODE, origin: 'teacher_led', idempotencyKey: `precalc:teacher-led:submission:${acknowledgement._id}`});
  expect(rows.srs_cards).toHaveLength(0);
  cleanup(); render(await lesson());
  expect(screen.queryByRole('button', {name: 'Mark worked example reviewed'})).not.toBeInTheDocument();
  expect(screen.queryByText('Your work and explanation')).not.toBeInTheDocument();
  for (const [name, answers] of [
    ['Guided', ['[0,3] U [7,9]', '[3,7]', 'none']],
    ['Independent', ['[0,2]', '[4,8]', '[2,4]']],
  ] as const) {
    vi.mocked(Date.now).mockReturnValue(name === 'Guided' ? 40 : 50);
    const card = screen.getByRole('heading', {name: `${name} Practice: Classify Graph Intervals`}).closest('section')!.parentElement!;
    const ui = within(card);
    ['increasing','decreasing','constant'].forEach((part,index) => fireEvent.change(ui.getByRole('textbox', {name: new RegExp(part+' intervals','i')}), {target: {value: answers[index]}}));
    fireEvent.click(ui.getByRole('button', {name: /submit answer/i}));
    await waitFor(() => expect(ui.getByRole('button', {name: 'Start new attempt'})).toBeInTheDocument());
    expect(rows.srs_cards).toHaveLength(name === 'Guided' ? 0 : 1);
    expect(rows.srs_review_log).toHaveLength(name === 'Guided' ? 0 : 1);
  }
  expect(rows.activity_submissions).toHaveLength(4);
  expect(rows.learning_evidence_receipts).toHaveLength(2);
  expect(rows.learning_evidence).toHaveLength(3);
  for (const row of rows.learning_evidence) expect(row.nodeId).toBe(NODE);
  const independent = rows.activity_submissions.find(row => row.activityId === 'physical-independent_practice')!;
  expect(independent).toMatchObject({ userId: 'student', stableActivityId: `${NODE}.independent_practice`, attemptOrdinal: 1, score: 3, maxScore: 3 });
  expect(independent.submissionData.parts).toHaveLength(3);
  for (const part of independent.submissionData.parts) expect(part).toMatchObject({hintsUsed: 0, revealStepsSeen: 0, changedCount: 0, isCorrect: true, score: 1, maxScore: 1});
  expect(rows.learning_evidence.find(row => row.mode === 'guided_practice')).not.toHaveProperty('gradedEvidence');
  expect(rows.learning_evidence.find(row => row.mode === 'independent_practice')).toMatchObject({ learnerId: 'student', submissionId: independent._id, activityId: `${NODE}.independent_practice`, attemptOrdinal: 1, occurredAt: 50, gradedEvidence: { isCorrect: true, score: 3, maxScore: 3 } });
  expect(rows.srs_cards[0]).toMatchObject({studentId: 'student', objectiveId: NODE, problemFamilyId: `${NODE}.independent_practice`, reps: 1, lapses: 0});
  expect(rows.srs_review_log[0]).toMatchObject({ studentId: 'student', cardId: rows.srs_cards[0]._id, submissionId: independent._id, rating: 'Good', reviewedAt: 50, evidence: {baseRating: 'Good', timingAdjusted: false} });
  vi.mocked(Date.now).mockReturnValue(60);
  const replay = await evidencePOST(new Request('http://test.local/api/learning-evidence/precalculus-pilot', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({submissionId: independent._id})}));
  expect(replay.status).toBe(200);
  expect(await replay.json()).toMatchObject({delivery: 'replay', persisted: true, masteryApplied: true, kstApplied: false});
  expect(rows.learning_evidence).toHaveLength(3);
  expect(rows.learning_evidence_receipts).toHaveLength(2);
  expect(rows.srs_cards).toHaveLength(1);
  expect(rows.srs_review_log).toHaveLength(1);
  expect(rows.activity_submissions.filter(row => row.activityId === 'physical-guided_practice')).toHaveLength(2);
  expect(rows.activity_submissions.filter(row => row.activityId === 'physical-independent_practice')).toHaveLength(1);

  // A phase with other lesson content keeps its ordinary response form and history.
  rows.phase_sections.push({ _id: 'mixed-text', phaseVersionId: 'phase', sequenceOrder: 3, sectionType: 'text', createdAt: 1, content: { markdown: 'Explain a related observation.' } });
  rows.lesson_responses.push({ _id: 'historical-response', phaseId: 'phase', learnerId: 'student', response: 'My earlier explanation', createdAt: 1 });
  cleanup(); render(await lesson());
  expect(screen.getByText('Your work and explanation')).toBeInTheDocument();
  expect(screen.getByText('My earlier explanation')).toBeInTheDocument();

  rows.phase_sections.splice(1);
  rows.phase_sections[0].content.activityId = 'wrong-physical';
  cleanup(); render(await lesson());
  expect(screen.getByText('Your work and explanation')).toBeInTheDocument();

  rows.phase_sections[0].content.activityId = 'physical';
  rows.phase_sections[0].content.componentKey = 'unrelated-component';
  cleanup(); render(await lesson());
  expect(screen.getByText('Your work and explanation')).toBeInTheDocument();

  rows.activities[0].approval.status = 'draft';
  rows.phase_sections[0].content = {};
  cleanup(); render(await lesson());
  expect(screen.getByText('Your work and explanation')).toBeInTheDocument();
});
