import graphBlueprints from "../../curriculum/skill-graph/blueprints.json";
import graphNodes from "../../curriculum/skill-graph/nodes.json";
import {
  guidedPracticeSpecSchema,
  independentPracticeSpecSchema,
  workedExampleSpecSchema,
} from "@math-platform/knowledge-space-practice";
import { buildPublishedCurriculumManifest } from "../curriculum/published-manifest";
import { normalizePracticeValue } from "./contract";
import { accountingEquationEventDrafts } from "./drafts/accounting-equation-event";
import { accountingEquationEventPropsSchema } from "../schemas/accounting-equation-event.schema";

export const BM2_ACCOUNTING_EQUATION_EVENT_NODE_ID = "math.bm2.skill.1.1.apply-accounting-equation";
export const BM2_ACCOUNTING_EQUATION_EVENT_COMPONENT_KEY = "accounting-equation-event";
export const BM2_ACCOUNTING_EQUATION_EVENT_LESSON_SLUG = "unit-1-lesson-1";

export const BM2_ACCOUNTING_EQUATION_EVENT_ACTIVITIES = [
  {
    stableActivityId: "unit-1-lesson-1-accounting-equation-event-worked",
    mode: "worked_example",
    canCreateApplicationEvidence: false,
  },
  {
    stableActivityId: "unit-1-lesson-1-accounting-equation-event-guided",
    mode: "guided_practice",
    canCreateApplicationEvidence: false,
  },
  {
    stableActivityId: "unit-1-lesson-1-accounting-equation-event-independent",
    mode: "independent_practice",
    canCreateApplicationEvidence: true,
  },
] as const;

export type Bm2AccountingEquationEventActivity =
  (typeof BM2_ACCOUNTING_EQUATION_EVENT_ACTIVITIES)[number];

export function getBm2AccountingEquationEventActivity(
  stableActivityId: string,
): Bm2AccountingEquationEventActivity | null {
  return (
    BM2_ACCOUNTING_EQUATION_EVENT_ACTIVITIES.find(
      (activity) => activity.stableActivityId === stableActivityId,
    ) ?? null
  );
}

export function getBm2AccountingEquationEventProps(activity: Bm2AccountingEquationEventActivity) {
  const draft =
    activity.mode === "worked_example"
      ? accountingEquationEventDrafts.worked
      : activity.mode === "guided_practice"
        ? accountingEquationEventDrafts.guided
        : accountingEquationEventDrafts.independent;
  return { ...draft, activityId: activity.stableActivityId };
}

/** True when a stored row is the exact reviewed input for the private event grader. */
export function isBm2AccountingEquationEventStoredActivity(
  activity: Bm2AccountingEquationEventActivity,
  stored: { componentKey?: unknown; props?: unknown },
): boolean {
  if (stored.componentKey !== BM2_ACCOUNTING_EQUATION_EVENT_COMPONENT_KEY) return false;
  const parsed = accountingEquationEventPropsSchema.safeParse(stored.props);
  const expected = accountingEquationEventPropsSchema.safeParse(
    getBm2AccountingEquationEventProps(activity),
  );
  return (
    parsed.success &&
    expected.success &&
    normalizePracticeValue(parsed.data) === normalizePracticeValue(expected.data)
  );
}

/** True only after the exact event blueprint and all three lesson rows are published. */
export function isBm2AccountingEquationEventPublished(): boolean {
  const node = graphNodes.nodes.find(
    (candidate) => candidate.id === BM2_ACCOUNTING_EQUATION_EVENT_NODE_ID,
  );
  const blueprint = graphBlueprints.blueprints.find(
    (candidate) => candidate.nodeId === BM2_ACCOUNTING_EQUATION_EVENT_NODE_ID,
  );
  const lesson = buildPublishedCurriculumManifest().lessons.find(
    (candidate) => candidate.slug === BM2_ACCOUNTING_EQUATION_EVENT_LESSON_SLUG,
  );

  return (
    node?.kind === "skill" &&
    node.reviewStatus === "reviewed" &&
    blueprint?.reviewStatus === "reviewed" &&
    blueprint.rendererKey === BM2_ACCOUNTING_EQUATION_EVENT_COMPONENT_KEY &&
    workedExampleSpecSchema.safeParse(blueprint.workedExampleSpec).success &&
    guidedPracticeSpecSchema.safeParse(
      "guidedPracticeSpec" in blueprint ? blueprint.guidedPracticeSpec : undefined,
    ).success &&
    independentPracticeSpecSchema.safeParse(blueprint.independentPracticeSpec).success &&
    BM2_ACCOUNTING_EQUATION_EVENT_ACTIVITIES.every((expected) =>
      lesson?.activities.some(
        (activity) =>
          activity.key === expected.stableActivityId &&
          isBm2AccountingEquationEventStoredActivity(expected, activity),
      ),
    )
  );
}
