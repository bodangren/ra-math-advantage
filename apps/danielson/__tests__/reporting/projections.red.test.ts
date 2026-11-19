import { describe, expect, it } from "vitest";

import {
  comparePortfolioRows,
  paginatePortfolioRows,
  projectCurrentProficiency,
  projectOfficialEvaluation,
  projectPortfolioRow,
} from "../../lib/reporting/projections";
import { rankPriorityTargets } from "../../lib/observations/queue";
import { buildDanielsonGraph } from "../../lib/proficiency/graph";
import { applyPriorityOverlays } from "../../lib/reporting/projections";

const NOW = Date.parse("2026-11-01T00:00:00.000Z");

type Priority = {
  teacherId: string;
  skillId: string;
  componentId: string;
  sourceRecordId: string;
  due: boolean;
  dueAt: string | null;
  overdueDays: number;
  currentProficiency: {
    rawRating: number | null;
    points: number | null;
    passes: boolean;
  };
  evidenceGaps: string[];
  approvedPriorityInputs: string[];
};

function approvedSkills() {
  const graph = buildDanielsonGraph().graph;
  const componentBySkill = new Map(
    graph.edges
      .filter((edge) => edge.type === "contains")
      .filter((edge) =>
        graph.nodes.some((node) => node.id === edge.targetId && node.kind === "skill"),
      )
      .map((edge) => [edge.targetId, edge.sourceId]),
  );
  return graph.nodes
    .filter((node) => node.kind === "skill" && node.reviewStatus === "approved")
    .map((node) => ({ skillId: node.id, componentId: componentBySkill.get(node.id) ?? "" }))
    .sort((left, right) => left.skillId.localeCompare(right.skillId));
}

function priorities(teacherId = "teacher_profiles:one", rating: 1 | 2 | 3 | 4 = 3): Priority[] {
  const points = { 1: 70, 2: 80, 3: 90, 4: 100 }[rating];
  return approvedSkills().map(({ skillId, componentId }) => ({
    teacherId,
    skillId,
    componentId,
    sourceRecordId: `observation_records:${encodeURIComponent(skillId)}`,
    due: false,
    dueAt: "2027-01-01T00:00:00.000Z",
    overdueDays: 0,
    currentProficiency: { rawRating: rating, points, passes: rating >= 3 },
    evidenceGaps: [],
    approvedPriorityInputs: [
      "due_status",
      "overdue_duration",
      "current_proficiency",
      "evidence_gap",
    ],
  }));
}

function portfolioRow(input: {
  teacherProfileId: string;
  displayName: string;
  priorities?: Priority[];
}) {
  return projectPortfolioRow({
    teacherProfileId: input.teacherProfileId,
    displayName: input.displayName,
    priorities: input.priorities ?? priorities(input.teacherProfileId),
    now: NOW,
  });
}

describe("Danielson reporting projections", () => {
  it("returns the first three priority targets from the existing queue order", () => {
    const input = priorities().map((item, index) =>
      index < 4
        ? {
            ...item,
            currentProficiency:
              index === 0 ? { rawRating: 1, points: 70, passes: false } : item.currentProficiency,
            due: index < 3,
            overdueDays: index === 0 ? 5 : 0,
          }
        : item,
    );
    const expected = rankPriorityTargets(input)
      .slice(0, 3)
      .map((target, index) => ({
        rank: (index + 1) as 1 | 2 | 3,
        skillId: target.skillId,
        reason: target.reason,
      }));

    expect(projectCurrentProficiency({ priorities: input }).priorityTargets).toEqual(expected);
    expect(expected).toHaveLength(3);
  });

  it("applies the existing PIP overlay before report target ranking", () => {
    const base = priorities().find((item) => item.skillId === "danielson.tlac.skill.cold-call");
    expect(base).toBeDefined();
    const overlaid = applyPriorityOverlays({
      priorities: [base!],
      pipOverlays: new Map([
        [
          "danielson.tlac.skill.cold-call",
          {
            approvedAt: Date.parse("2026-10-20T00:00:00.000Z"),
            planEndAt: Date.parse("2026-11-30T00:00:00.000Z"),
            latestRatedEvidenceAt: null,
          },
        ],
      ]),
      gbfAssignment: null,
      now: NOW,
    });

    expect(overlaid[0].approvedPriorityInputs).toContain("approved_plan_priority");
    expect(projectCurrentProficiency({ priorities: overlaid }).priorityTargets).toEqual([
      {
        rank: 1,
        skillId: "danielson.tlac.skill.cold-call",
        reason: "approved_plan_priority",
      },
    ]);
  });

  it("uses formal component evidence when skill evidence cannot determine a component", () => {
    const graph = buildDanielsonGraph().graph;
    const componentEvidence = graph.nodes
      .filter((node) => node.kind === "instructional_unit")
      .map((node) => ({
        componentId: node.id,
        rawRating: 3 as const,
        sourceRecordId: "observation_records:formal-q4",
      }));

    expect(projectCurrentProficiency({ priorities: [], componentEvidence })).toMatchObject({
      state: "proficient",
      domains: expect.arrayContaining([expect.objectContaining({ state: "proficient" })]),
    });
    expect(
      projectPortfolioRow({
        teacherProfileId: "teacher_profiles:one",
        displayName: "Teacher One",
        priorities: [],
        componentEvidence,
        now: NOW,
      }),
    ).toMatchObject({
      danielson: { state: "proficient", belowComponentIds: [] },
    });
  });

  it("requires all 22 components and never averages away a low skill", () => {
    const partial = priorities();
    const graph = buildDanielsonGraph().graph;
    const componentIds = graph.nodes
      .filter((node) => node.kind === "instructional_unit")
      .map((node) => node.id);
    const coveredComponentIds = new Set(partial.map((item) => item.componentId));

    expect(componentIds).toHaveLength(22);
    expect(coveredComponentIds.size).toBeLessThan(22);
    expect(
      portfolioRow({
        teacherProfileId: "teacher_profiles:one",
        displayName: "Teacher One",
        priorities: partial,
      }),
    ).toMatchObject({
      danielson: { state: "not_enough_evidence", belowComponentIds: [] },
      attentionReasons: [],
    });

    const lowComponentId = partial[0].componentId;
    const oneLow = partial.map((item, index) =>
      index === 0
        ? {
            ...item,
            currentProficiency: { rawRating: 2, points: 80, passes: false },
          }
        : item,
    );
    expect(
      portfolioRow({
        teacherProfileId: "teacher_profiles:one",
        displayName: "Teacher One",
        priorities: oneLow,
      }),
    ).toMatchObject({
      danielson: {
        state: "below_proficient",
        belowComponentIds: [lowComponentId],
      },
      attentionReasons: ["below_proficient"],
    });

    expect(
      portfolioRow({
        teacherProfileId: "teacher_profiles:one",
        displayName: "Teacher One",
        priorities: partial.slice(1),
      }),
    ).toMatchObject({ danielson: { state: "not_enough_evidence" } });
  });

  it("preserves the Track 2 source record on current skill proficiency", () => {
    const sourceRecordId = "observation_records:walkthrough-source";
    const input = priorities().map((item, index) =>
      index === 0 ? { ...item, sourceRecordId } : item,
    );
    const current = projectCurrentProficiency({ priorities: input });
    const skill = current.domains
      .flatMap((domain) => domain.components)
      .flatMap((component) => component.skills)
      .find((candidate) => candidate.skillId === input[0].skillId);

    expect(skill).toMatchObject({ sourceRecordId });
  });

  it("returns exact neutral IP and GBF seams before their source tracks are active", () => {
    expect(
      portfolioRow({
        teacherProfileId: "teacher_profiles:one",
        displayName: "Teacher One",
      }),
    ).toMatchObject({
      improvementPlan: {
        contractVersion: "danielson.ip-progress.v1",
        state: "not_configured",
      },
      gbf: {
        contractVersion: "danielson.gbf-progress.v1",
        state: "not_configured",
      },
    });
  });

  it("separates due from overdue and does not turn missing evidence into an overdue failure", () => {
    const dueWithoutCard = priorities().map((item, index) =>
      index === 0
        ? {
            ...item,
            due: true,
            dueAt: null,
            currentProficiency: { rawRating: null, points: null, passes: false },
            evidenceGaps: ["no_valid_rated_evidence"],
          }
        : item,
    );
    const dueRow = portfolioRow({
      teacherProfileId: "teacher_profiles:due",
      displayName: "Due Teacher",
      priorities: dueWithoutCard,
    });
    expect(dueRow).toMatchObject({
      evidenceDue: { state: "due", dueCount: 1, overdueCount: 0 },
      attentionReasons: [],
    });

    const overdue = priorities().map((item, index) =>
      index === 0
        ? {
            ...item,
            due: true,
            dueAt: "2026-10-27T00:00:00.000Z",
            overdueDays: 5,
          }
        : item,
    );
    expect(
      portfolioRow({
        teacherProfileId: "teacher_profiles:overdue",
        displayName: "Overdue Teacher",
        priorities: overdue,
      }),
    ).toMatchObject({
      evidenceDue: {
        state: "overdue",
        dueCount: 1,
        overdueCount: 1,
        maximumOverdueDays: 5,
      },
      attentionReasons: ["overdue_evidence"],
    });
  });

  it("uses the declared attention order and deterministic tie breaks", () => {
    const low = priorities("teacher_profiles:low").map((item, index) =>
      index === 0
        ? {
            ...item,
            currentProficiency: { rawRating: 2, points: 80, passes: false },
          }
        : item,
    );
    const overdue = priorities("teacher_profiles:overdue").map((item, index) =>
      index === 0
        ? {
            ...item,
            due: true,
            dueAt: "2026-10-20T00:00:00.000Z",
            overdueDays: 12,
          }
        : item,
    );
    const rows = [
      portfolioRow({
        teacherProfileId: "teacher_profiles:none",
        displayName: "Zulu",
        priorities: priorities("teacher_profiles:none"),
      }),
      portfolioRow({
        teacherProfileId: "teacher_profiles:overdue",
        displayName: "Able",
        priorities: overdue,
      }),
      portfolioRow({
        teacherProfileId: "teacher_profiles:low",
        displayName: "Zulu",
        priorities: low,
      }),
      portfolioRow({
        teacherProfileId: "teacher_profiles:a",
        displayName: "Same",
        priorities: priorities("teacher_profiles:a"),
      }),
      portfolioRow({
        teacherProfileId: "teacher_profiles:b",
        displayName: "Same",
        priorities: priorities("teacher_profiles:b"),
      }),
    ].sort(comparePortfolioRows);

    expect(rows.map((row) => row.teacherProfileId)).toEqual([
      "teacher_profiles:low",
      "teacher_profiles:overdue",
      "teacher_profiles:a",
      "teacher_profiles:b",
      "teacher_profiles:none",
    ]);
  });

  it("paginates more than 50 sorted teachers without a duplicate or omission", () => {
    const rows = Array.from({ length: 61 }, (_, index) =>
      portfolioRow({
        teacherProfileId: `teacher_profiles:${String(index).padStart(2, "0")}`,
        displayName: `Teacher ${String(index).padStart(2, "0")}`,
        priorities: priorities(`teacher_profiles:${String(index).padStart(2, "0")}`),
      }),
    ).sort(comparePortfolioRows);

    const first = paginatePortfolioRows(rows, { cursor: null, pageSize: 25 });
    const second = paginatePortfolioRows(rows, { cursor: first.continueCursor, pageSize: 25 });
    const third = paginatePortfolioRows(rows, { cursor: second.continueCursor, pageSize: 25 });
    const ids = [...first.items, ...second.items, ...third.items].map(
      (row) => row.teacherProfileId,
    );

    expect(first.items).toHaveLength(25);
    expect(second.items).toHaveLength(25);
    expect(third.items).toHaveLength(11);
    expect(third.isDone).toBe(true);
    expect(new Set(ids)).toHaveLength(61);
    expect(ids).toEqual(rows.map((row) => row.teacherProfileId));
    expect(() =>
      paginatePortfolioRows(rows, { cursor: "teacher_profiles:missing", pageSize: 25 }),
    ).toThrow("invalid_cursor");
  });

  it("keeps official ratings and current skill proficiency in separate projections", () => {
    const componentIds = [
      "danielson.framework.component.1a",
      "danielson.framework.component.1b",
      "danielson.framework.component.1c",
      "danielson.framework.component.1d",
    ];
    const record = {
      draftId: "observation_records:q1",
      observationId: "observation_records:q1",
      organizationId: "organizations:one",
      teacherProfileId: "teacher_profiles:one",
      observerAccountId: "accounts:observer",
      observationType: "formal_q1" as const,
      schoolYear: "2026-2027",
      sourceVersion: "danielson-observation.v1",
      frameworkVersion: "danielson-2022",
      observedAt: "2026-09-01T00:00:00.000Z",
      status: "submitted" as const,
      revision: 1,
      createdAt: NOW,
      updatedAt: NOW,
      submissionKey: "q1-key",
      submissionFingerprint: "q1-fingerprint",
      submittedAt: NOW,
      publishedAt: NOW,
      items: componentIds.map((componentId, index) => ({
        itemId: componentId,
        componentId,
        outcome: { kind: "rated" as const, rating: [4, 4, 4, 2][index] as 1 | 2 | 3 | 4 },
        evidenceNote: null,
      })),
    };
    const official = projectOfficialEvaluation({
      record,
      amendments: [],
      observerDisplayName: "Observer One",
    });
    const current = projectCurrentProficiency({ priorities: priorities() });

    expect(official).toMatchObject({
      observationId: "observation_records:q1",
      observationType: "formal_q1",
      status: "below_proficient",
      components: [
        expect.objectContaining({ componentId: componentIds[0], rawRating: 4, points: 100 }),
        expect.objectContaining({ componentId: componentIds[1], rawRating: 4, points: 100 }),
        expect.objectContaining({ componentId: componentIds[2], rawRating: 4, points: 100 }),
        expect.objectContaining({ componentId: componentIds[3], rawRating: 2, points: 80 }),
      ],
    });
    expect(official).not.toHaveProperty("average");
    expect(current).toMatchObject({ state: "not_enough_evidence" });
    expect(current.domains.flatMap((domain) => domain.components)).toHaveLength(22);
    expect(current).not.toHaveProperty("officialEvaluations");
  });

  it("preserves the formal rating that supplies a current component state", () => {
    const current = projectCurrentProficiency({
      priorities: [],
      componentEvidence: [
        {
          componentId: "danielson.framework.component.1a",
          rawRating: 4,
          sourceRecordId: "observation_records:component-source",
        },
      ],
    });
    const component = current.domains
      .flatMap((domain) => domain.components)
      .find((candidate) => candidate.componentId === "danielson.framework.component.1a");

    expect(component).toMatchObject({
      state: "proficient",
      rawRating: 4,
      points: 100,
      sourceRecordId: "observation_records:component-source",
    });
  });

  it("maps each official raw rating to the exact derived points", () => {
    const componentIds = [
      "danielson.framework.component.1a",
      "danielson.framework.component.1b",
      "danielson.framework.component.1c",
      "danielson.framework.component.1d",
    ];
    const base = {
      draftId: "observation_records:q4",
      observationId: "observation_records:q4",
      organizationId: "organizations:one",
      teacherProfileId: "teacher_profiles:one",
      observerAccountId: "accounts:observer",
      observationType: "formal_q4" as const,
      schoolYear: "2026-2027",
      sourceVersion: "danielson-observation.v1",
      frameworkVersion: "danielson-2022",
      observedAt: "2027-05-01T00:00:00.000Z",
      status: "submitted" as const,
      revision: 1,
      createdAt: NOW,
      updatedAt: NOW,
      submissionKey: "q4-key",
      submissionFingerprint: "q4-fingerprint",
      submittedAt: NOW,
      publishedAt: NOW,
      items: componentIds.map((componentId, index) => ({
        itemId: componentId,
        componentId,
        outcome: { kind: "rated" as const, rating: (index + 1) as 1 | 2 | 3 | 4 },
        evidenceNote: null,
      })),
    };

    const projected = projectOfficialEvaluation({
      record: base,
      amendments: [],
      observerDisplayName: "Observer One",
    });
    expect(
      projected.components.map((component: { rawRating: number | null; points: number | null }) => [
        component.rawRating,
        component.points,
      ]),
    ).toEqual([
      [1, 70],
      [2, 80],
      [3, 90],
      [4, 100],
    ]);
  });
});
