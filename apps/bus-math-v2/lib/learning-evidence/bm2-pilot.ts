import graphNodes from "../../curriculum/skill-graph/nodes.json";
import graphBlueprints from "../../curriculum/skill-graph/blueprints.json";
import { buildPublishedCurriculumManifest } from "../curriculum/published-manifest";
import { AUTHORED_UNIT_1_LESSONS } from "../curriculum/generated/unit1-authored";

const BM2_PILOT_NODE_ID = "math.bm2.skill.1.1.apply-accounting-equation";
const BM2_PILOT_LESSON_ID = "d6b57545-65f6-4c39-80d5-000000000001";
const BM2_PILOT_LESSON_SLUG = "unit-1-lesson-1";
const BM2_PILOT_ACTIVITY_ID = "d6b57545-65f6-4c39-80d5-000100001002";
const BM2_PILOT_ACTIVITY_KEY = "unit-1-lesson-1-activity-1";
const BM2_PILOT_VARIANT_KEY = "accounting-equation";

/** The only BM2 learning-evidence node enabled by this pilot. */
export const BM2_PILOT_NODE = BM2_PILOT_NODE_ID;

/** The reviewed authored stable activity ID for the BM2 pilot. */
export const BM2_PILOT_SOURCE_ACTIVITY_ID = BM2_PILOT_ACTIVITY_ID;

/** The reviewed legacy BM2 SRS identifier for the pilot variant. */
export const BM2_PILOT_PROBLEM_FAMILY_ID = BM2_PILOT_VARIANT_KEY;

/** True when the exact reviewed source activity is available to students. */
export function isBm2PilotSourcePublished(): boolean {
  const blueprint = graphBlueprints.blueprints.find(
    (candidate) => candidate.nodeId === BM2_PILOT_NODE_ID,
  );
  const node = graphNodes.nodes.find((candidate) => candidate.id === BM2_PILOT_NODE_ID);
  const lesson = buildPublishedCurriculumManifest().lessons.find(
    (candidate) => candidate.slug === BM2_PILOT_LESSON_SLUG,
  );
  const activity = lesson?.activities.find((candidate) => candidate.key === BM2_PILOT_ACTIVITY_KEY);
  const authoredLesson = AUTHORED_UNIT_1_LESSONS.find(
    (candidate) => candidate.lesson.id === BM2_PILOT_LESSON_ID,
  );
  const authoredActivity = authoredLesson?.activities.find(
    (candidate) => candidate.id === BM2_PILOT_ACTIVITY_ID,
  );
  return (
    node?.kind === "skill" &&
    node.reviewStatus === "reviewed" &&
    blueprint?.reviewStatus === "reviewed" &&
    blueprint.metadata.activityIds.includes(BM2_PILOT_ACTIVITY_KEY) &&
    lesson?.version.status === "published" &&
    activity?.componentKey === "notebook-organizer" &&
    authoredActivity?.componentKey === "notebook-organizer"
  );
}

/** True when the reviewed adaptive pilot has all three mode specifications. */
export function isBm2PilotPublished(): boolean {
  const blueprint = graphBlueprints.blueprints.find(
    (candidate) => candidate.nodeId === BM2_PILOT_NODE_ID,
  );
  return (
    isBm2PilotSourcePublished() &&
    blueprint?.reviewStatus === "reviewed" &&
    blueprint.rendererKey === "notebook-organizer" &&
    "workedExampleSpec" in blueprint &&
    "guidedPracticeSpec" in blueprint &&
    "independentPracticeSpec" in blueprint
  );
}

export const BM2_PILOT_MODES = [
  "worked_example",
  "guided_practice",
  "independent_practice",
] as const;

/**
 * Convert the BM2 storage identifier to the canonical SRS identifier.
 *
 * BM2 storage keeps `problemFamilyId` for compatibility. The conversion is
 * deliberately limited to the reviewed pilot mapping.
 */
export function bm2ProblemFamilyIdToVariantKey(problemFamilyId: string): string {
  if (problemFamilyId.trim() !== BM2_PILOT_PROBLEM_FAMILY_ID) {
    throw new Error(`Unsupported BM2 problemFamilyId: ${problemFamilyId}`);
  }
  return BM2_PILOT_VARIANT_KEY;
}

/** Convert the canonical pilot variant back to BM2's legacy storage field. */
export function bm2VariantKeyToProblemFamilyId(variantKey: string): string {
  if (variantKey.trim() !== BM2_PILOT_VARIANT_KEY) {
    throw new Error(`Unsupported BM2 variantKey: ${variantKey}`);
  }
  return BM2_PILOT_PROBLEM_FAMILY_ID;
}

export const BM2_LEARNING_EVIDENCE_PILOT = {
  enabledNodeIds: [BM2_PILOT_NODE_ID],
  mappings: [
    {
      nodeId: BM2_PILOT_NODE_ID,
      source: {
        lessonId: BM2_PILOT_LESSON_ID,
        lessonSlug: BM2_PILOT_LESSON_SLUG,
        activityId: BM2_PILOT_ACTIVITY_ID,
        activityKey: BM2_PILOT_ACTIVITY_KEY,
        mode: "guided_practice",
      },
      masteryAdvantage: {
        activityId: BM2_PILOT_VARIANT_KEY,
        problemFamilyId: BM2_PILOT_VARIANT_KEY,
        variantKey: BM2_PILOT_VARIANT_KEY,
      },
    },
  ],
} as const;
