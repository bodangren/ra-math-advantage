import { describe, expect, it, vi } from "vitest";

const catalogs = vi.hoisted(() => ({
  nodes: {
    nodes: [
      {
        id: "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs",
        kind: "skill",
        reviewStatus: "approved",
      },
    ],
  },
  blueprints: {
    blueprints: [
      {
        nodeId:
          "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs",
        reviewStatus: "approved",
        rendererKey: "interval-classification",
        rendererModeMap: {
          worked: "interval-classification",
          guidedPractice: "interval-classification",
          independentPractice: "interval-classification",
        },
        guidedPracticeSpec: {
          scaffoldedPrompt:
            "Identify the intervals where the graph increases, decreases, and stays constant.",
          stepPrompts: [
            "Mark the domain endpoints and the change points x=3 and x=7.",
            "Read each graph segment from left to right and decide whether it rises, falls, or stays flat.",
            "Write each interval. Use U or ∪ between multiple intervals. Enter none when no interval exists.",
          ],
          hints: [
            "Use the two change points to separate the graph into three segments.",
            "Read each segment from left to right.",
            "Enter none when no segment has the requested behavior.",
          ],
          checksPerStep: [
            {
              check:
                "The domain endpoints and both change points are identified.",
            },
            {
              check: "Each segment is classified as rising, falling, or flat.",
            },
            { check: "All three interval fields are completed." },
          ],
          revealPolicy: "one_at_a_time",
          rendererProps: {
            title: "Guided Practice: Classify Graph Intervals",
            prompt:
              "Identify the intervals where the graph increases, decreases, and stays constant.",
            domain: [0, 9],
            changePoints: [3, 7],
            points: [
              { x: 0, y: 1 },
              { x: 3, y: 7 },
              { x: 7, y: 2 },
              { x: 9, y: 6 },
            ],
            presentationMode: "guided_practice",
            guidedSteps: [
              "Mark the domain endpoints and the change points x=3 and x=7.",
              "Read each graph segment from left to right and decide whether it rises, falls, or stays flat.",
              "Write each interval. Use U or ∪ between multiple intervals. Enter none when no interval exists.",
            ],
            fieldHelp: {
              increasingIntervals: "Find every segment that rises.",
              decreasingIntervals: "Find every segment that falls.",
              constantIntervals: "Check whether any segment stays flat.",
            },
          },
        },
        independentPracticeSpec: {
          variantParameters: {
            seed: {
              type: "integer",
              min: 0,
              description:
                "Deterministic Topic 1.1 interval graph variant seed",
            },
          },
          answerSchema: {
            increasingIntervals: "string",
            decreasingIntervals: "string",
            constantIntervals: "string",
          },
          gradingRules: [
            { partId: "increasingIntervals", ruleType: "custom", maxScore: 1 },
            { partId: "decreasingIntervals", ruleType: "custom", maxScore: 1 },
            { partId: "constantIntervals", ruleType: "custom", maxScore: 1 },
          ],
          replayPolicy: "any_seed",
          rendererProps: {
            title: "Independent Practice: Classify Graph Intervals",
            prompt:
              "Identify the intervals where the graph increases, decreases, and stays constant.",
            domain: [0, 8],
            changePoints: [2, 4],
            points: [
              { x: 0, y: 5 },
              { x: 2, y: 8 },
              { x: 4, y: 8 },
              { x: 8, y: 6 },
            ],
            presentationMode: "independent_practice",
          },
        },
        generatorKey: "topic11-interval-graph",
        gradingSpec: {
          partIds: [
            "increasingIntervals",
            "decreasingIntervals",
            "constantIntervals",
          ],
          passingScore: 3,
          partialCredit: true,
          rubric: [
            {
              partId: "increasingIntervals",
              points: 1,
              criteria: "Correct increasing intervals",
            },
            {
              partId: "decreasingIntervals",
              points: 1,
              criteria: "Correct decreasing intervals",
            },
            {
              partId: "constantIntervals",
              points: 1,
              criteria: "Correct constant intervals",
            },
          ],
        },
      },
    ],
  },
}));
vi.mock("@/curriculum/skill-graph/nodes.json", () => ({
  default: catalogs.nodes,
}));
vi.mock("@/curriculum/skill-graph/blueprints.json", () => ({
  default: catalogs.blueprints,
}));


import type { Id } from '@/convex/_generated/dataModel';
import type { MutationCtx, QueryCtx } from '@/convex/_generated/server';
import { getPrecalculusPilotKnowledgeStateHandler } from '@/convex/learningEvidence';
import { submitRoutedEvidenceHandler } from '@/convex/selectedLearningEvidence';
import { createPrecalculusPilotRoute } from '@/app/api/learning-evidence/precalculus-pilot/route';
import {
  PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY,
  PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_GRADING_CONFIG,
  PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GENERATOR_KEY,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_COMPONENT_KEY,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_GUIDED_GRADING_CONFIG,
  PRECALCULUS_TOPIC_12_INDEPENDENT_GRADING_CONFIG,
} from '@/convex/activities';
import { generateTopic11IntervalGraph } from '@/lib/practice/topic11-interval-graph';
import { generateTopic11PhysicalContextGraphChoice } from '@math-platform/math-content/knowledge-space';
import { generateTopic12TableAverageRateChoice } from '@math-platform/math-content/knowledge-space';
import { generateTopic12GraphAverageRateChoice } from '@math-platform/math-content/knowledge-space';
import { generateTopic12NegativeRateContextChoiceOutput } from '@math-platform/math-content/knowledge-space';
import { generateTopic12QuadraticNegativeRateIntervalChoiceOutput } from '@math-platform/math-content/knowledge-space';
import { generateTopic12PointwiseLeastRateChoice } from '@math-platform/math-content/knowledge-space';
import { generateTopic12PointwiseRateOrderingOutput } from '@math-platform/math-content/knowledge-space';
import {
  PRECALCULUS_PILOT_NODE_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
  PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NODE_ID,
  PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'profiles:precalc-production-flow-learner' as Id<'profiles'>;
const OTHER_LEARNER_ID = 'profiles:precalc-production-flow-other-learner';
const ACTIVITY_ID = 'activities:precalc-topic-1-1-pilot';
const PILOT_ACTIVITY_ID = `${PRECALCULUS_PILOT_NODE_ID}.guided_practice`;
const INDEPENDENT_ACTIVITY_ID = `${PRECALCULUS_PILOT_NODE_ID}.independent_practice`;
const INDEPENDENT_ACTIVITY_DOCUMENT_ID = 'activities:precalc-topic-1-1-pilot-independent';
const PHYSICAL_GUIDED_ACTIVITY_DOCUMENT_ID = 'activities:precalc-physical-context-guided';
const PHYSICAL_INDEPENDENT_ACTIVITY_DOCUMENT_ID = 'activities:precalc-physical-context-independent';
const TOPIC_12_GUIDED_ACTIVITY_DOCUMENT_ID = 'activities:precalc-topic-1-2-guided';
const TOPIC_12_INDEPENDENT_ACTIVITY_DOCUMENT_ID = 'activities:precalc-topic-1-2-independent';
const TOPIC_12_WORKED_ACTIVITY_DOCUMENT_ID = 'activities:precalc-topic-1-2-worked';
const TOPIC_12_GRAPH_GUIDED_ACTIVITY_DOCUMENT_ID = 'activities:precalc-topic-1-2-graph-guided';
const TOPIC_12_GRAPH_INDEPENDENT_ACTIVITY_DOCUMENT_ID = 'activities:precalc-topic-1-2-graph-independent';
const TOPIC_12_GRAPH_WORKED_ACTIVITY_DOCUMENT_ID = 'activities:precalc-topic-1-2-graph-worked';
const TOPIC_12_POINTWISE_GUIDED_ACTIVITY_DOCUMENT_ID = 'activities:precalc-topic-1-2-pointwise-guided';
const TOPIC_12_POINTWISE_INDEPENDENT_ACTIVITY_DOCUMENT_ID = 'activities:precalc-topic-1-2-pointwise-independent';
const TOPIC_12_POINTWISE_WORKED_ACTIVITY_DOCUMENT_ID = 'activities:precalc-topic-1-2-pointwise-worked';
const TOPIC_12_POINTWISE_ORDERING_GUIDED_ACTIVITY_DOCUMENT_ID = 'activities:precalc-topic-1-2-pointwise-ordering-guided';
const TOPIC_12_POINTWISE_ORDERING_INDEPENDENT_ACTIVITY_DOCUMENT_ID = 'activities:precalc-topic-1-2-pointwise-ordering-independent';
const TOPIC_12_POINTWISE_ORDERING_WORKED_ACTIVITY_DOCUMENT_ID = 'activities:precalc-topic-1-2-pointwise-ordering-worked';
const FIRST_IDEMPOTENCY_KEY = 'precalc-production-flow-create-1';
const SECOND_IDEMPOTENCY_KEY = 'precalc-production-flow-create-2';
const KNOWLEDGE_STATE_NOW = Date.parse('2026-08-21T12:00:00.000Z');
const PILOT_TITLE = 'Identify intervals of increase, decrease, and constant behavior from graphs';

type Row = Record<string, unknown> & { _id: string };
type InternalHandler<Args, Result> = (ctx: MutationCtx, args: Args) => Promise<Result>;
type ServerOwnedSubmissionResult = {
  submissionId: string;
  score: number;
  maxScore: number;
  feedback: string;
  attemptOrdinal: number;
};
type ServerOwnedSubmissionHandler = InternalHandler<{
  userId: string;
  activityId: string;
  submissionData: Record<string, unknown>;
  idempotencyKey: string;
}, ServerOwnedSubmissionResult>;

const submitHandler = submitRoutedEvidenceHandler as unknown as InternalHandler<
  { learnerId: string; submissionId: string },
  Record<string, unknown>
>;

async function loadServerOwnedSubmissionHandler(): Promise<ServerOwnedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createServerOwnedSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error(
      'AP Precalculus must export internal createServerOwnedSubmission. It must accept the '
        + 'authenticated user, the exact stable activity ID, a raw practice.v1 envelope, and an idempotency key only.',
    );
  }
  return mutation._handler as ServerOwnedSubmissionHandler;
}

async function loadPhysicalContextSubmissionHandler(): Promise<ServerOwnedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createPhysicalContextSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error(
      'AP Precalculus must export internal createPhysicalContextSubmission for physical graph-choice submissions.',
    );
  }
  return mutation._handler as ServerOwnedSubmissionHandler;
}

async function loadTopic12TableSubmissionHandler(): Promise<ServerOwnedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic12TableAverageRateSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error(
      'AP Precalculus must export createTopic12TableAverageRateSubmission for Topic 1.2 table submissions.',
    );
  }
  return mutation._handler as ServerOwnedSubmissionHandler;
}

async function loadTopic12GraphSubmissionHandler(): Promise<ServerOwnedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic12GraphAverageRateSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error(
      'AP Precalculus must export createTopic12GraphAverageRateSubmission for Topic 1.2 graph submissions.',
    );
  }
  return mutation._handler as ServerOwnedSubmissionHandler;
}

async function loadTopic12NegativeRateContextSubmissionHandler(): Promise<ServerOwnedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic12NegativeRateContextSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error(
      'AP Precalculus must export createTopic12NegativeRateContextSubmission for Topic 1.2 negative-rate context submissions.',
    );
  }
  return mutation._handler as ServerOwnedSubmissionHandler;
}

async function loadTopic12QuadraticNegativeRateIntervalSubmissionHandler(): Promise<ServerOwnedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic12QuadraticNegativeRateIntervalSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error(
      'AP Precalculus must export createTopic12QuadraticNegativeRateIntervalSubmission for Topic 1.2 quadratic interval submissions.',
    );
  }
  return mutation._handler as ServerOwnedSubmissionHandler;
}

async function loadTopic12PointwiseSubmissionHandler(): Promise<ServerOwnedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic12PointwiseLeastRateSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error(
      'AP Precalculus must export createTopic12PointwiseLeastRateSubmission for Topic 1.2 pointwise submissions.',
    );
  }
  return mutation._handler as ServerOwnedSubmissionHandler;
}

async function loadTopic12PointwiseOrderingSubmissionHandler(): Promise<ServerOwnedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic12PointwiseRateOrderingSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error(
      'AP Precalculus must export createTopic12PointwiseRateOrderingSubmission for Topic 1.2 ordering submissions.',
    );
  }
  return mutation._handler as ServerOwnedSubmissionHandler;
}

async function loadTopic12PointwiseOrderingWorkedSubmissionHandler(): Promise<Topic12WorkedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic12PointwiseRateOrderingWorkedSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error(
      'AP Precalculus must export createTopic12PointwiseRateOrderingWorkedSubmission for Topic 1.2 ordering Worked reviews.',
    );
  }
  return mutation._handler as Topic12WorkedSubmissionHandler;
}

async function loadTopic12PointwiseOrderingWorkedEvidenceHandler(): Promise<Topic12WorkedEvidenceHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/learningEvidence');
  const mutation = importedModule.submitTopic12PointwiseRateOrderingWorkedSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error(
      'AP Precalculus must export submitTopic12PointwiseRateOrderingWorkedSubmission for Topic 1.2 ordering Worked evidence.',
    );
  }
  return mutation._handler as Topic12WorkedEvidenceHandler;
}

type Topic12WorkedSubmissionHandler = InternalHandler<{
  userId: string;
  activityId: string;
  submissionData: Record<string, unknown>;
  idempotencyKey: string;
}, ServerOwnedSubmissionResult>;

async function loadTopic12WorkedSubmissionHandler(): Promise<Topic12WorkedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic12TableAverageRateWorkedSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error(
      'AP Precalculus must export createTopic12TableAverageRateWorkedSubmission for Topic 1.2 Worked reviews.',
    );
  }
  return mutation._handler as Topic12WorkedSubmissionHandler;
}

type Topic12WorkedEvidenceHandler = InternalHandler<{
  learnerId: string;
  submissionId: string;
}, Record<string, unknown>>;

async function loadTopic12WorkedEvidenceHandler(): Promise<Topic12WorkedEvidenceHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/learningEvidence');
  const mutation = importedModule.submitTopic12TableAverageRateWorkedSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error(
      'AP Precalculus must export submitTopic12TableAverageRateWorkedSubmission for Topic 1.2 Worked evidence.',
    );
  }
  return mutation._handler as Topic12WorkedEvidenceHandler;
}

async function loadTopic12GraphWorkedSubmissionHandler(): Promise<Topic12WorkedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic12GraphAverageRateWorkedSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error(
      'AP Precalculus must export createTopic12GraphAverageRateWorkedSubmission for Topic 1.2 graph Worked reviews.',
    );
  }
  return mutation._handler as Topic12WorkedSubmissionHandler;
}

async function loadTopic12GraphWorkedEvidenceHandler(): Promise<Topic12WorkedEvidenceHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/learningEvidence');
  const mutation = importedModule.submitTopic12GraphAverageRateWorkedSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error(
      'AP Precalculus must export submitTopic12GraphAverageRateWorkedSubmission for Topic 1.2 graph Worked evidence.',
    );
  }
  return mutation._handler as Topic12WorkedEvidenceHandler;
}

async function loadTopic12PointwiseWorkedSubmissionHandler(): Promise<Topic12WorkedSubmissionHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = importedModule.createTopic12PointwiseLeastRateWorkedSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error(
      'AP Precalculus must export createTopic12PointwiseLeastRateWorkedSubmission for Topic 1.2 pointwise Worked reviews.',
    );
  }
  return mutation._handler as Topic12WorkedSubmissionHandler;
}

async function loadTopic12PointwiseWorkedEvidenceHandler(): Promise<Topic12WorkedEvidenceHandler> {
  const importedModule = await vi.importActual<Record<string, unknown>>('@/convex/learningEvidence');
  const mutation = importedModule.submitTopic12PointwiseLeastRateWorkedSubmission as { _handler?: unknown } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error(
      'AP Precalculus must export submitTopic12PointwiseLeastRateWorkedSubmission for Topic 1.2 pointwise Worked evidence.',
    );
  }
  return mutation._handler as Topic12WorkedEvidenceHandler;
}

function makeSubmission(overrides: Partial<{
  increasingIntervals: string;
  decreasingIntervals: string;
  constantIntervals: string;
}> = {}): Record<string, unknown> {
  const answers = {
    increasingIntervals: '[0,3] U [7,9]',
    decreasingIntervals: '[3,7]',
    constantIntervals: 'none',
    ...overrides,
  };

  return {
    contractVersion: 'practice.v1',
    activityId: PILOT_ACTIVITY_ID,
    mode: 'guided_practice',
    status: 'submitted',
    // This required browser field is not the server-owned attempt ordinal.
    attemptNumber: 99,
    submittedAt: '2026-08-19T10:00:00.000Z',
    answers,
    parts: [
      { partId: 'increasingIntervals', rawAnswer: answers.increasingIntervals },
      { partId: 'decreasingIntervals', rawAnswer: answers.decreasingIntervals },
      { partId: 'constantIntervals', rawAnswer: answers.constantIntervals },
    ],
  };
}

function formatIntervals(intervals: readonly (readonly [number, number])[]): string {
  return intervals.length === 0
    ? 'none'
    : intervals.map(([start, end]) => `[${start},${end}]`).join(' U ');
}

function makeIndependentSubmission(): Record<string, unknown> {
  const variant = generateTopic11IntervalGraph(2);
  const answers = {
    increasingIntervals: formatIntervals(variant.increasingIntervals),
    decreasingIntervals: formatIntervals(variant.decreasingIntervals),
    constantIntervals: formatIntervals(variant.constantIntervals),
  };

  return {
    contractVersion: 'practice.v1',
    activityId: INDEPENDENT_ACTIVITY_ID,
    mode: 'independent_practice',
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2026-08-19T11:00:00.000Z',
    answers,
    parts: [
      { partId: 'increasingIntervals', rawAnswer: answers.increasingIntervals },
      { partId: 'decreasingIntervals', rawAnswer: answers.decreasingIntervals },
      { partId: 'constantIntervals', rawAnswer: answers.constantIntervals },
    ],
  };
}

type PhysicalPracticeMode = 'guided_practice' | 'independent_practice';

function makePhysicalSubmission(mode: PhysicalPracticeMode): Record<string, unknown> {
  const activityId = mode === 'guided_practice'
    ? PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID
    : PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID;
  const variant = generateTopic11PhysicalContextGraphChoice(mode === 'guided_practice' ? 1 : 2);
  const selectedOptionId = variant.correctOptionId;
  return {
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2026-08-19T11:00:00.000Z',
    answers: { selectedOptionId },
    parts: [{ partId: 'selectedOptionId', rawAnswer: selectedOptionId }],
  };
}

function makeTopic12Submission(mode: PhysicalPracticeMode): Record<string, unknown> {
  const activityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID;
  const variant = generateTopic12TableAverageRateChoice(mode === 'guided_practice' ? 1 : 2);
  const selectedOptionId = variant.correctOptionId;
  return {
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2026-08-19T12:00:00.000Z',
    answers: { selectedOptionId },
    parts: [{ partId: 'selectedOptionId', rawAnswer: selectedOptionId }],
  };
}

function makeTopic12GraphSubmission(mode: PhysicalPracticeMode): Record<string, unknown> {
  const activityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID;
  const variant = generateTopic12GraphAverageRateChoice(mode === 'guided_practice' ? 1 : 2);
  const selectedOptionId = variant.correctOptionId;
  return {
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2026-08-19T13:00:00.000Z',
    answers: { selectedOptionId },
    parts: [{ partId: 'selectedOptionId', rawAnswer: selectedOptionId }],
  };
}

function makeTopic12NegativeRateContextSubmission(mode: PhysicalPracticeMode): Record<string, unknown> {
  const seed = mode === 'guided_practice' ? 1 : 2;
  const activityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID;
  const selectedOptionId = (generateTopic12NegativeRateContextChoiceOutput(seed).expectedAnswer as {
    selectedOptionId: string;
  }).selectedOptionId;
  return {
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2026-08-19T13:30:00.000Z',
    answers: { selectedOptionId },
    parts: [{ partId: 'selectedOptionId', rawAnswer: selectedOptionId }],
  };
}

function makeTopic12QuadraticNegativeRateIntervalSubmission(mode: PhysicalPracticeMode): Record<string, unknown> {
  const seed = mode === 'guided_practice' ? 1 : 2;
  const activityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID;
  const selectedOptionId = (generateTopic12QuadraticNegativeRateIntervalChoiceOutput(seed).expectedAnswer as {
    selectedOptionId: string;
  }).selectedOptionId;
  return {
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2026-08-19T13:45:00.000Z',
    answers: { selectedOptionId },
    parts: [{ partId: 'selectedOptionId', rawAnswer: selectedOptionId }],
  };
}

function makeTopic12PointwiseSubmission(mode: PhysicalPracticeMode): Record<string, unknown> {
  const activityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID;
  const variant = generateTopic12PointwiseLeastRateChoice(mode === 'guided_practice' ? 1 : 2);
  const selectedOptionId = variant.correctOptionId;
  return {
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2026-08-19T14:00:00.000Z',
    answers: { selectedOptionId },
    parts: [{ partId: 'selectedOptionId', rawAnswer: selectedOptionId }],
  };
}

function makeTopic12PointwiseOrderingSubmission(mode: PhysicalPracticeMode): Record<string, unknown> {
  const activityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID;
  const variant = generateTopic12PointwiseRateOrderingOutput(mode === 'guided_practice' ? 1 : 2);
  const orderedPointIds = [...(variant.expectedAnswer as { orderedPointIds: readonly string[] }).orderedPointIds];
  return {
    contractVersion: 'practice.v1',
    activityId,
    mode,
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2026-08-19T15:00:00.000Z',
    answers: { orderedPointIds },
    parts: [{ partId: 'orderedPointIds', rawAnswer: orderedPointIds }],
  };
}

function makeTopic12PointwiseOrderingWorkedSubmission(): Record<string, unknown> {
  const orderedPointIds = [
    ...(generateTopic12PointwiseRateOrderingOutput(0).expectedAnswer as { orderedPointIds: readonly string[] }).orderedPointIds,
  ];
  return {
    contractVersion: 'practice.v1',
    activityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2026-08-19T15:30:00.000Z',
    answers: { orderedPointIds },
    parts: [{ partId: 'orderedPointIds', rawAnswer: orderedPointIds }],
  };
}

function makeTopic12WorkedSubmission(): Record<string, unknown> {
  return {
    contractVersion: 'practice.v1',
    activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2026-08-19T12:30:00.000Z',
    answers: { selectedOptionId: 'C' },
    parts: [{ partId: 'selectedOptionId', rawAnswer: 'C' }],
  };
}

function makeTopic12GraphWorkedSubmission(): Record<string, unknown> {
  const selectedOptionId = generateTopic12GraphAverageRateChoice(0).correctOptionId;
  return {
    contractVersion: 'practice.v1',
    activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2026-08-19T13:30:00.000Z',
    answers: { selectedOptionId },
    parts: [{ partId: 'selectedOptionId', rawAnswer: selectedOptionId }],
  };
}

function makeTopic12PointwiseWorkedSubmission(): Record<string, unknown> {
  const selectedOptionId = generateTopic12PointwiseLeastRateChoice(0).correctOptionId;
  return {
    contractVersion: 'practice.v1',
    activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 99,
    submittedAt: '2026-08-19T14:30:00.000Z',
    answers: { selectedOptionId },
    parts: [{ partId: 'selectedOptionId', rawAnswer: selectedOptionId }],
  };
}

type QueryResult = {
  unique(): Promise<Row | null>;
  first(): Promise<Row | null>;
  collect(): Promise<Row[]>;
  take(limit: number): Promise<Row[]>;
  order(direction: 'asc' | 'desc'): QueryResult;
  filter(predicate: unknown): QueryResult;
};

function createConvexHarness(
  includePhysicalTeacherExposure = false,
  includeTopic12TeacherExposure = false,
  includeTopic12GraphTeacherExposure = false,
  includeTopic12PointwiseTeacherExposure = false,
  includeTopic12PointwiseOrderingTeacherExposure = false,
) {
  const rows: Record<string, Row[]> = {
    profiles: [{
      _id: LEARNER_ID,
      organizationId: 'organizations:precalc-production-flow',
      username: 'precalc-production-flow-learner',
      role: 'student',
    }, {
      _id: OTHER_LEARNER_ID,
      organizationId: 'organizations:precalc-production-flow',
      username: 'precalc-production-flow-other-learner',
      role: 'student',
    }],
    auth_credentials: [{
      _id: 'auth_credentials:precalc-production-flow-learner',
      profileId: LEARNER_ID,
      organizationId: 'organizations:precalc-production-flow',
      username: 'precalc-production-flow-learner',
      role: 'student',
      isActive: true,
    }, {
      _id: 'auth_credentials:precalc-production-flow-other-learner',
      profileId: OTHER_LEARNER_ID,
      organizationId: 'organizations:precalc-production-flow',
      username: 'precalc-production-flow-other-learner',
      role: 'student',
      isActive: true,
    }],
    activities: [{
      _id: ACTIVITY_ID,
      stableActivityId: PILOT_ACTIVITY_ID,
      componentKey: 'precalculus-mastery-advantage-pilot',
      displayName: 'Mastery Advantage: Identify Graph Intervals',
      description: 'Classify the increasing, decreasing, and constant intervals from a graph.',
      props: { nodeId: PRECALCULUS_PILOT_NODE_ID, mode: 'guided_practice' },
      gradingConfig: { variantSeed: 0 },
      approval: { status: 'approved' },
      createdAt: 1,
      updatedAt: 1,
    }, {
      _id: INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      stableActivityId: INDEPENDENT_ACTIVITY_ID,
      componentKey: 'precalculus-mastery-advantage-pilot',
      displayName: 'Independent Practice: Classify Graph Intervals',
      description: 'Classify the increasing, decreasing, and constant intervals from a generated graph.',
      props: { nodeId: PRECALCULUS_PILOT_NODE_ID, mode: 'independent_practice' },
      gradingConfig: { variantSeed: 2 },
      approval: { status: 'approved' },
      createdAt: 1,
      updatedAt: 1,
    }, {
      _id: PHYSICAL_GUIDED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY,
      displayName: 'Topic 1.1 physical-context graph choice guided practice',
      props: { presentationMode: 'guided_practice' },
      gradingConfig: PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_GRADING_CONFIG,
      createdAt: 1,
      updatedAt: 1,
    }, {
      _id: PHYSICAL_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_PHYSICAL_CONTEXT_COMPONENT_KEY,
      displayName: 'Topic 1.1 physical-context graph choice independent practice',
      props: { presentationMode: 'independent_practice' },
      gradingConfig: PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_GRADING_CONFIG,
      createdAt: 1,
      updatedAt: 1,
    }, {
      _id: TOPIC_12_GUIDED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_COMPONENT_KEY,
      displayName: 'Topic 1.2 table average-rate guided practice',
      props: { presentationMode: 'guided_practice' },
      gradingConfig: PRECALCULUS_TOPIC_12_GUIDED_GRADING_CONFIG,
      createdAt: 1,
      updatedAt: 1,
    }, {
      _id: TOPIC_12_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_COMPONENT_KEY,
      displayName: 'Topic 1.2 table average-rate independent practice',
      props: { presentationMode: 'independent_practice' },
      gradingConfig: PRECALCULUS_TOPIC_12_INDEPENDENT_GRADING_CONFIG,
      createdAt: 1,
      updatedAt: 1,
    }, {
      _id: TOPIC_12_WORKED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_COMPONENT_KEY,
      displayName: 'Topic 1.2 table average-rate Worked example',
      props: { presentationMode: 'worked_example' },
      gradingConfig: {
        generatorKey: 'topic12-table-average-rate-choice',
        variantSeed: 0,
      },
      createdAt: 1,
      updatedAt: 1,
    }, {
      _id: TOPIC_12_GRAPH_GUIDED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_COMPONENT_KEY,
      displayName: 'Topic 1.2 graph average-rate guided practice',
      props: { presentationMode: 'guided_practice' },
      gradingConfig: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_GRADING_CONFIG,
      createdAt: 1,
      updatedAt: 1,
    }, {
      _id: TOPIC_12_GRAPH_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_COMPONENT_KEY,
      displayName: 'Topic 1.2 graph average-rate independent practice',
      props: { presentationMode: 'independent_practice' },
      gradingConfig: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_GRADING_CONFIG,
      createdAt: 1,
      updatedAt: 1,
    }, {
      _id: TOPIC_12_GRAPH_WORKED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_COMPONENT_KEY,
      displayName: 'Topic 1.2 graph average-rate Worked example',
      props: { presentationMode: 'worked_example' },
      gradingConfig: {
        generatorKey: 'topic12-graph-average-rate-choice',
        variantSeed: 0,
      },
      createdAt: 1,
      updatedAt: 1,
    }, {
      _id: TOPIC_12_POINTWISE_GUIDED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY,
      displayName: 'Topic 1.2 pointwise least-rate guided practice',
      props: { presentationMode: 'guided_practice' },
      gradingConfig: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_GRADING_CONFIG,
      createdAt: 1,
      updatedAt: 1,
    }, {
      _id: TOPIC_12_POINTWISE_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY,
      displayName: 'Topic 1.2 pointwise least-rate independent practice',
      props: { presentationMode: 'independent_practice' },
      gradingConfig: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_GRADING_CONFIG,
      createdAt: 1,
      updatedAt: 1,
    }, {
      _id: TOPIC_12_POINTWISE_WORKED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_COMPONENT_KEY,
      displayName: 'Topic 1.2 pointwise least-rate Worked example',
      props: { presentationMode: 'worked_example' },
      gradingConfig: {
        generatorKey: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GENERATOR_KEY,
        variantSeed: 0,
      },
      createdAt: 1,
      updatedAt: 1,
    }, {
      _id: TOPIC_12_POINTWISE_ORDERING_GUIDED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_COMPONENT_KEY,
      displayName: 'Topic 1.2 pointwise rate-ordering Guided practice',
      props: { presentationMode: 'guided_practice' },
      gradingConfig: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_GRADING_CONFIG,
      createdAt: 1,
      updatedAt: 1,
    }, {
      _id: TOPIC_12_POINTWISE_ORDERING_INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_COMPONENT_KEY,
      displayName: 'Topic 1.2 pointwise rate-ordering Independent practice',
      props: { presentationMode: 'independent_practice' },
      gradingConfig: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_GRADING_CONFIG,
      createdAt: 1,
      updatedAt: 1,
    }, {
      _id: TOPIC_12_POINTWISE_ORDERING_WORKED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
      componentKey: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_COMPONENT_KEY,
      displayName: 'Topic 1.2 pointwise rate-ordering Worked example',
      props: { presentationMode: 'worked_example' },
      gradingConfig: { ...PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_GRADING_CONFIG },
      createdAt: 1,
      updatedAt: 1,
    }],
    activity_submissions: [],
    learning_evidence: [{
      _id: 'learning_evidence:precalc-production-flow-teacher-exposure',
      learnerId: LEARNER_ID,
      nodeId: PRECALCULUS_PILOT_NODE_ID,
      activityId: PRECALCULUS_TOPIC_11_SOURCE_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: Date.parse('2026-08-19T09:00:00.000Z'),
      idempotencyKey: 'precalc-production-flow-teacher-exposure',
      createdAt: 1,
    }, ...(includePhysicalTeacherExposure ? [{
      _id: 'learning_evidence:precalc-production-flow-physical-teacher-exposure',
      learnerId: LEARNER_ID,
      nodeId: PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
      activityId: PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: Date.parse('2026-08-19T09:30:00.000Z'),
      idempotencyKey: 'precalc-production-flow-physical-teacher-exposure',
      createdAt: 1,
    }] : []), ...(includeTopic12TeacherExposure ? [{
      _id: 'learning_evidence:precalc-production-flow-topic-1-2-teacher-exposure',
      learnerId: LEARNER_ID,
      nodeId: PRECALCULUS_TOPIC_12_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: Date.parse('2026-08-19T09:45:00.000Z'),
      idempotencyKey: 'precalc-production-flow-topic-1-2-teacher-exposure',
      createdAt: 1,
    }] : []), ...(includeTopic12GraphTeacherExposure ? [{
      _id: 'learning_evidence:precalc-production-flow-topic-1-2-graph-teacher-exposure',
      learnerId: LEARNER_ID,
      nodeId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: Date.parse('2026-08-19T09:50:00.000Z'),
      idempotencyKey: 'precalc-production-flow-topic-1-2-graph-teacher-exposure',
      createdAt: 1,
    }] : []), ...(includeTopic12PointwiseTeacherExposure ? [{
      _id: 'learning_evidence:precalc-production-flow-topic-1-2-pointwise-teacher-exposure',
      learnerId: LEARNER_ID,
      nodeId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: Date.parse('2026-08-19T09:55:00.000Z'),
      idempotencyKey: 'precalc-production-flow-topic-1-2-pointwise-teacher-exposure',
      createdAt: 1,
    }] : []), ...(includeTopic12PointwiseOrderingTeacherExposure ? [{
      _id: 'learning_evidence:precalc-production-flow-topic-1-2-pointwise-ordering-teacher-exposure',
      learnerId: LEARNER_ID,
      nodeId: PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: Date.parse('2026-08-19T10:00:00.000Z'),
      idempotencyKey: 'precalc-production-flow-topic-1-2-pointwise-ordering-teacher-exposure',
      createdAt: 1,
    }] : [])],
    learning_evidence_receipts: [],
    srs_cards: [],
    srs_review_log: [],
  };
  const trace: string[] = [];
  const queryEvents: string[] = [];
  const operationTrace: string[] = [];

  const query = (tableName: string) => {
    operationTrace.push(`${tableName}:query`);
    return {
      withIndex: (
        indexName: string,
        configure: (query: {
          eq(field: string, value: unknown): unknown;
          lte(field: string, value: unknown): unknown;
        }) => unknown,
      ) => {
        queryEvents.push(`${tableName}:${indexName}`);
        if (tableName === 'activities' && indexName !== 'by_stable_activity_id') {
          throw new Error('The Precalculus pilot must resolve its activity through by_stable_activity_id.');
        }
        const conditions = new Map<string, unknown>();
        const upperBounds = new Map<string, unknown>();
        const index = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return index;
          },
          lte(field: string, value: unknown) {
            upperBounds.set(field, value);
            return index;
          },
        };
        configure(index);
        const selected = () => (rows[tableName] ?? []).filter((row) => (
          [...conditions].every(([field, value]) => row[field] === value)
          && [...upperBounds].every(([field, value]) => (
            typeof row[field] === 'number'
            && typeof value === 'number'
            && row[field] <= value
          ))
        ));
        const result: QueryResult = {
          unique: async () => selected()[0] ?? null,
          first: async () => selected()[0] ?? null,
          collect: async () => selected(),
          take: async (limit) => selected().slice(0, limit),
          order: () => result,
          filter: () => result,
        };
        return result;
      },
    };
  };
  const get = async (...args: string[]) => {
    const id = args.at(-1);
    return Object.values(rows).flat().find((row) => row._id === id) ?? null;
  };
  const insert = async (tableName: string, document: Record<string, unknown>) => {
    const id = `${tableName}:${(rows[tableName] ?? []).length + 1}`;
    (rows[tableName] ??= []).push({ _id: id, ...document });
    trace.push(`${tableName}:insert`);
    operationTrace.push(`${tableName}:insert`);
    return id;
  };
  const patch = async (id: string, document: Record<string, unknown>) => {
    const row = Object.values(rows).flat().find((candidate) => candidate._id === id);
    if (!row) throw new Error(`Unknown patch target: ${id}`);
    Object.assign(row, document);
    trace.push('srs_cards:patch');
    operationTrace.push('srs_cards:patch');
  };

  return {
    ctx: { db: { query, get, insert, patch } } as unknown as MutationCtx,
    rows,
    trace,
    queryEvents,
    operationTrace,
  };
}

function opaqueRoute(ctx: MutationCtx, learnerId = LEARNER_ID) {
  return createPrecalculusPilotRoute({
    getServerSession: async () => ({ user: { id: learnerId, role: 'student' } }),
    submitLearningEvidence: ({ learnerId: authenticatedLearnerId, submissionId }) => (
      submitHandler(ctx, { learnerId: authenticatedLearnerId, submissionId })
    ),
  });
}

function opaqueRequest(body: unknown) {
  return new Request('http://localhost/api/learning-evidence/precalculus-pilot', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Precalculus server-owned producer to opaque evidence transaction', () => {
  it('uses the indexed dedicated activity and grades all three raw Topic 1.1 classifications on the server', async () => {
    const producer = await loadServerOwnedSubmissionHandler();
    const { ctx, queryEvents, rows } = createConvexHarness();

    const result = await producer(ctx, {
      userId: LEARNER_ID,
      activityId: PILOT_ACTIVITY_ID,
      submissionData: makeSubmission(),
      idempotencyKey: FIRST_IDEMPOTENCY_KEY,
    });
    expect(result).toStrictEqual({
      submissionId: 'activity_submissions:1',
      score: 3,
      maxScore: 3,
      feedback: '3/3 interval classifications matched the server rubric.',
      attemptOrdinal: 1,
    });
    expect(JSON.stringify(result)).not.toContain('[0,3] U [7,9]');
    expect(result.feedback).not.toContain('[3,7]');
    expect(result.feedback).not.toContain('none');
    expect(queryEvents).toContain('activities:by_stable_activity_id');
    expect(rows.activity_submissions).toEqual([expect.objectContaining({
      _id: result.submissionId,
      userId: LEARNER_ID,
      activityId: ACTIVITY_ID,
      createIdempotencyKey: FIRST_IDEMPOTENCY_KEY,
      attemptOrdinal: 1,
      score: 3,
      maxScore: 3,
      feedback: '3/3 interval classifications matched the server rubric.',
      submissionData: expect.objectContaining({
        activityId: PILOT_ACTIVITY_ID,
        mode: 'guided_practice',
        status: 'graded',
        answers: {
          increasingIntervals: '[0,3]U[7,9]',
          decreasingIntervals: '[3,7]',
          constantIntervals: 'none',
        },
      }),
    })]);
  });

  it('replays the same key, rejects a changed body, and gives the same raw answer a new server ordinal under a new key', async () => {
    const producer = await loadServerOwnedSubmissionHandler();
    const { ctx, rows } = createConvexHarness();
    const rawSubmission = makeSubmission();

    const first = await producer(ctx, {
      userId: LEARNER_ID,
      activityId: PILOT_ACTIVITY_ID,
      submissionData: rawSubmission,
      idempotencyKey: FIRST_IDEMPOTENCY_KEY,
    });
    const replay = await producer(ctx, {
      userId: LEARNER_ID,
      activityId: PILOT_ACTIVITY_ID,
      submissionData: rawSubmission,
      idempotencyKey: FIRST_IDEMPOTENCY_KEY,
    });

    expect(first).toStrictEqual({
      submissionId: 'activity_submissions:1',
      score: 3,
      maxScore: 3,
      feedback: '3/3 interval classifications matched the server rubric.',
      attemptOrdinal: 1,
    });
    expect(replay).toStrictEqual(first);
    expect(rows.activity_submissions).toHaveLength(1);

    await expect(producer(ctx, {
      userId: LEARNER_ID,
      activityId: PILOT_ACTIVITY_ID,
      submissionData: makeSubmission({ constantIntervals: '[4,6]' }),
      idempotencyKey: FIRST_IDEMPOTENCY_KEY,
    })).rejects.toThrow(/idempotency_conflict/i);
    expect(rows.activity_submissions).toHaveLength(1);

    await expect(producer(ctx, {
      userId: LEARNER_ID,
      activityId: PILOT_ACTIVITY_ID,
      submissionData: rawSubmission,
      idempotencyKey: SECOND_IDEMPOTENCY_KEY,
    })).resolves.toStrictEqual({
      submissionId: 'activity_submissions:2',
      score: 3,
      maxScore: 3,
      feedback: '3/3 interval classifications matched the server rubric.',
      attemptOrdinal: 2,
    });
    expect(rows.activity_submissions).toHaveLength(2);
  });

  it('rejects a legacy forged row before mastery, evidence, or receipt writes', async () => {
    const { ctx, rows, trace } = createConvexHarness();
    rows.activity_submissions.push({
      _id: 'activity_submissions:legacy-forged',
      userId: LEARNER_ID,
      activityId: 'activities:unrelated-legacy-activity',
      submissionData: { ...makeSubmission(), status: 'graded' },
      masteryContractVersion: 'learning-evidence.v1',
      score: 3,
      maxScore: 3,
      submittedAt: 1,
      gradedAt: 1,
      createdAt: 1,
      updatedAt: 1,
    });

    const response = await opaqueRoute(ctx).POST(opaqueRequest({
      submissionId: 'activity_submissions:legacy-forged',
    }));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Submission not found' });
    expect(trace).toEqual([]);
    expect(rows.learning_evidence).toHaveLength(1);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
  });

  it('rejects malformed stored data for the exact pilot before any effect', async () => {
    const { ctx, rows, trace } = createConvexHarness();
    rows.activity_submissions.push({
      _id: 'activity_submissions:malformed-exact-pilot',
      userId: LEARNER_ID,
      activityId: ACTIVITY_ID,
      stableActivityId: PILOT_ACTIVITY_ID,
      submissionData: {
        contractVersion: 'practice.v1',
        activityId: PILOT_ACTIVITY_ID,
        mode: 'guided_practice',
        status: 'graded',
        attemptNumber: 1,
        submittedAt: '2026-08-19T10:00:00.000Z',
        answers: {
          increasingIntervals: '[-3,-1]',
          decreasingIntervals: '[-1,3]',
          constantIntervals: '[3,5]',
        },
      },
      masteryContractVersion: 'learning-evidence.v1',
      score: 3,
      maxScore: 3,
      attemptOrdinal: 1,
      submittedAt: 1,
      gradedAt: 1,
      createdAt: 1,
      updatedAt: 1,
    });

    const response = await opaqueRoute(ctx).POST(opaqueRequest({
      submissionId: 'activity_submissions:malformed-exact-pilot',
    }));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'Submission not found',
    });
    expect(trace).toEqual([]);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.learning_evidence).toHaveLength(1);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
  });

  it('delivers the stored server grade through one opaque ID and replays without a second effect', async () => {
    const producer = await loadServerOwnedSubmissionHandler();
    const { ctx, operationTrace, rows, trace } = createConvexHarness();

    const created = await producer(ctx, {
      userId: LEARNER_ID,
      activityId: PILOT_ACTIVITY_ID,
      submissionData: makeSubmission(),
      idempotencyKey: FIRST_IDEMPOTENCY_KEY,
    });
    const route = opaqueRoute(ctx);

    const forged = await route.POST(opaqueRequest({ submissionId: created.submissionId, score: 3 }));
    expect(forged.status).toBe(400);
    expect(trace).toEqual(['activity_submissions:insert']);

    const foreign = await opaqueRoute(ctx, OTHER_LEARNER_ID as Id<'profiles'>).POST(
      opaqueRequest({ submissionId: created.submissionId }),
    );
    expect(foreign.status).toBe(404);
    expect(trace).toEqual(['activity_submissions:insert']);

    const first = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(first.status).toBe(200);
    const firstResult = await first.json();
    expect(firstResult).toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: expect.objectContaining({ reason: 'ungraded_evidence' }),
    }));
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence[1]).toMatchObject({
      submissionId: created.submissionId,
      origin: 'mastery_advantage',
      mode: 'guided_practice',
    });
    expect(rows.learning_evidence[1]).not.toHaveProperty('gradedEvidence');
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    expect(operationTrace).not.toContain('srs_review_log:insert');
    expect(rows.learning_evidence_receipts).toEqual([expect.objectContaining({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
    })]);
    expect(trace).toEqual([
      'activity_submissions:insert',
      'learning_evidence:insert',
      'learning_evidence_receipts:insert',
    ]);

    const firstKnowledgeState = await getPrecalculusPilotKnowledgeStateHandler(ctx as unknown as QueryCtx, {
      learnerId: LEARNER_ID,
      now: KNOWLEDGE_STATE_NOW,
    });
    expect(firstKnowledgeState).toStrictEqual({
      nodeId: PRECALCULUS_PILOT_NODE_ID,
      title: PILOT_TITLE,
      status: 'not_started',
      readiness: 'ready',
    });
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);

    const traceAfterFirstDelivery = [...trace];
    const replay = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(replay.status).toBe(200);
    const replayResult = await replay.json();
    expect(replayResult).toEqual({ ...firstResult, delivery: 'replay' });
    expect(trace).toEqual(traceAfterFirstDelivery);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);

    await expect(getPrecalculusPilotKnowledgeStateHandler(ctx as unknown as QueryCtx, {
      learnerId: LEARNER_ID,
      now: KNOWLEDGE_STATE_NOW,
    })).resolves.toStrictEqual(firstKnowledgeState);
    expect(trace).toEqual(traceAfterFirstDelivery);
  });

  it.each([
    ['Guided', 'guided_practice'],
    ['Independent', 'independent_practice'],
  ] as const)('delivers a physical %s submission to exact-node evidence and one replay-safe SRS effect', async (
    _label,
    mode,
  ) => {
    const producer = await loadPhysicalContextSubmissionHandler();
    const { ctx, rows, trace } = createConvexHarness(true);
    const submissionData = makePhysicalSubmission(mode);
    const activityId = mode === 'guided_practice'
      ? PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID
      : PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID;
    const activityDocumentId = mode === 'guided_practice'
      ? PHYSICAL_GUIDED_ACTIVITY_DOCUMENT_ID
      : PHYSICAL_INDEPENDENT_ACTIVITY_DOCUMENT_ID;
    const firstKey = `precalc-physical-${mode}-create-1`;

    const created = await producer(ctx, {
      userId: LEARNER_ID,
      activityId,
      submissionData,
      idempotencyKey: firstKey,
    });

    expect(created).toStrictEqual({
      submissionId: 'activity_submissions:1',
      score: 1,
      maxScore: 1,
      feedback: '1/1 graph selections matched the server rubric.',
      attemptOrdinal: 1,
    });
    const stored = rows.activity_submissions[0]!;
    expect(stored).toMatchObject({
      _id: created.submissionId,
      userId: LEARNER_ID,
      activityId: activityDocumentId,
      stableActivityId: activityId,
      masteryContractVersion: 'learning-evidence.v1',
      score: 1,
      maxScore: 1,
      attemptOrdinal: 1,
      submissionData: {
        contractVersion: 'practice.v1',
        activityId,
        mode,
        status: 'graded',
        attemptNumber: 1,
        answers: { selectedOptionId: (submissionData.answers as { selectedOptionId: string }).selectedOptionId },
        parts: [{
          partId: 'selectedOptionId',
          rawAnswer: (submissionData.answers as { selectedOptionId: string }).selectedOptionId,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        }],
      },
    });
    expect(typeof stored.submittedAt).toBe('number');
    expect(stored.gradedAt).toBe(stored.submittedAt);
    expect((stored.submissionData as Record<string, unknown>).submittedAt).toBe(
      new Date(stored.submittedAt as number).toISOString(),
    );

    const route = opaqueRoute(ctx);
    const foreign = await opaqueRoute(ctx, OTHER_LEARNER_ID as Id<'profiles'>).POST(
      opaqueRequest({ submissionId: created.submissionId }),
    );
    expect(foreign.status).toBe(404);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    const first = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: 'new',
      decision: expect.objectContaining({
        reason: 'eligible',
        masteryBearing: true,
      }),
    }));
    expect(rows.learning_evidence).toHaveLength(3);
    expect(rows.learning_evidence[2]).toMatchObject({
      submissionId: created.submissionId,
      nodeId: PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
      activityId,
      origin: 'mastery_advantage',
      mode,
      attemptOrdinal: 1,
      occurredAt: stored.submittedAt,
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
    });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_cards[0]).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
      problemFamilyId: activityId,
    });
    expect(rows.srs_review_log).toHaveLength(1);
    expect(rows.srs_review_log[0]).toMatchObject({
      studentId: LEARNER_ID,
      submissionId: created.submissionId,
    });

    const traceAfterFirstDelivery = [...trace];
    const replay = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(replay.status).toBe(200);
    await expect(replay.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      delivery: 'replay',
    }));
    expect(trace).toEqual(traceAfterFirstDelivery);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.learning_evidence).toHaveLength(3);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
  });

  it('delivers the seeded Independent submission to exact-node evidence and one replay-safe SRS effect', async () => {
    const producer = await loadServerOwnedSubmissionHandler();
    const { ctx, rows, trace } = createConvexHarness();
    const created = await producer(ctx, {
      userId: LEARNER_ID,
      activityId: INDEPENDENT_ACTIVITY_ID,
      submissionData: makeIndependentSubmission(),
      idempotencyKey: 'precalc-independent-evidence-create-1',
    });
    const route = opaqueRoute(ctx);

    expect(created).toMatchObject({ score: 3, maxScore: 3, attemptOrdinal: 1 });
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.activity_submissions[0]).toMatchObject({
      stableActivityId: INDEPENDENT_ACTIVITY_ID,
      activityId: INDEPENDENT_ACTIVITY_DOCUMENT_ID,
      score: 3,
      maxScore: 3,
      submissionData: expect.objectContaining({
        activityId: INDEPENDENT_ACTIVITY_ID,
        mode: 'independent_practice',
        status: 'graded',
      }),
    });

    const first = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      delivery: 'new',
      decision: expect.objectContaining({ reason: 'eligible' }),
    }));
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence[1]).toMatchObject({
      submissionId: created.submissionId,
      nodeId: PRECALCULUS_PILOT_NODE_ID,
      activityId: INDEPENDENT_ACTIVITY_ID,
      origin: 'mastery_advantage',
      mode: 'independent_practice',
      gradedEvidence: { isCorrect: true, score: 3, maxScore: 3 },
    });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_cards[0]).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: PRECALCULUS_PILOT_NODE_ID,
      problemFamilyId: INDEPENDENT_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toHaveLength(1);
    expect(rows.srs_review_log[0]).toMatchObject({
      studentId: LEARNER_ID,
      submissionId: created.submissionId,
    });

    const traceAfterFirstDelivery = [...trace];
    const replay = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(replay.status).toBe(200);
    await expect(replay.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      delivery: 'replay',
    }));
    expect(trace).toEqual(traceAfterFirstDelivery);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
  });

  it.each([
    ['Guided', 'guided_practice'],
    ['Independent', 'independent_practice'],
  ] as const)('delivers a Topic 1.2 %s submission to exact-node evidence and one replay-safe SRS effect', async (
    _label,
    mode,
  ) => {
    const producer = await loadTopic12TableSubmissionHandler();
    const { ctx, rows, trace } = createConvexHarness(false, true);
    const submissionData = makeTopic12Submission(mode);
    const activityId = mode === 'guided_practice'
      ? PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID
      : PRECALCULUS_TOPIC_12_INDEPENDENT_ACTIVITY_ID;
    const activityDocumentId = mode === 'guided_practice'
      ? TOPIC_12_GUIDED_ACTIVITY_DOCUMENT_ID
      : TOPIC_12_INDEPENDENT_ACTIVITY_DOCUMENT_ID;
    const created = await producer(ctx, {
      userId: LEARNER_ID,
      activityId,
      submissionData,
      idempotencyKey: `precalc-topic-1-2-${mode}-create-1`,
    });
    const stored = rows.activity_submissions[0]!;

    expect(created).toMatchObject({ score: 1, maxScore: 1, attemptOrdinal: 1 });
    expect(stored).toMatchObject({
      activityId: activityDocumentId,
      stableActivityId: activityId,
      score: 1,
      maxScore: 1,
      attemptOrdinal: 1,
      submissionData: expect.objectContaining({ activityId, mode, status: 'graded' }),
    });

    const route = opaqueRoute(ctx);
    const foreign = await opaqueRoute(ctx, OTHER_LEARNER_ID as Id<'profiles'>).POST(
      opaqueRequest({ submissionId: created.submissionId }),
    );
    expect(foreign.status).toBe(404);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    const first = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: 'new',
      decision: expect.objectContaining({
        reason: 'eligible',
        masteryBearing: true,
      }),
    }));
    const storedEvidence = rows.learning_evidence.find((row) => row.submissionId === created.submissionId);
    expect(storedEvidence).toMatchObject({
      submissionId: created.submissionId,
      nodeId: PRECALCULUS_TOPIC_12_NODE_ID,
      activityId,
      origin: 'mastery_advantage',
      mode,
      attemptOrdinal: 1,
      occurredAt: stored.submittedAt,
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
    });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_cards[0]).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: PRECALCULUS_TOPIC_12_NODE_ID,
      problemFamilyId: activityId,
    });
    expect(rows.srs_review_log).toHaveLength(1);
    expect(rows.srs_review_log[0]).toMatchObject({
      studentId: LEARNER_ID,
      submissionId: created.submissionId,
    });

    const traceAfterFirstDelivery = [...trace];
    const replay = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(replay.status).toBe(200);
    await expect(replay.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      delivery: 'replay',
    }));
    expect(trace).toEqual(traceAfterFirstDelivery);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.learning_evidence).toHaveLength(3);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
  });

  it('waits for a Topic 1.2 Worked exposure before persisting mastery evidence', async () => {
    const producer = await loadTopic12TableSubmissionHandler();
    const { ctx, rows, trace } = createConvexHarness();
    const submissionData = makeTopic12Submission('guided_practice');
    const created = await producer(ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_GUIDED_ACTIVITY_ID,
      submissionData,
      idempotencyKey: 'precalc-topic-1-2-awaiting-exposure',
    });
    const response = await opaqueRoute(ctx).POST(opaqueRequest({ submissionId: created.submissionId }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: expect.objectContaining({
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      }),
    }));
    expect(trace).toEqual(['activity_submissions:insert']);
    expect(rows.learning_evidence).toHaveLength(1);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
  });

  it.each([
    ['Guided', 'guided_practice'],
    ['Independent', 'independent_practice'],
  ] as const)('delivers a graph average-rate %s submission to exact-node evidence and one replay-safe SRS effect', async (
    _label,
    mode,
  ) => {
    const producer = await loadTopic12GraphSubmissionHandler();
    const { ctx, rows, trace } = createConvexHarness(false, false, true);
    const submissionData = makeTopic12GraphSubmission(mode);
    const activityId = mode === 'guided_practice'
      ? PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID
      : PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_INDEPENDENT_ACTIVITY_ID;
    const activityDocumentId = mode === 'guided_practice'
      ? TOPIC_12_GRAPH_GUIDED_ACTIVITY_DOCUMENT_ID
      : TOPIC_12_GRAPH_INDEPENDENT_ACTIVITY_DOCUMENT_ID;

    const created = await producer(ctx, {
      userId: LEARNER_ID,
      activityId,
      submissionData,
      idempotencyKey: 'precalc-topic-1-2-graph-' + mode + '-create-1',
    });
    const stored = rows.activity_submissions[0]!;

    expect(created).toMatchObject({ score: 1, maxScore: 1, attemptOrdinal: 1 });
    expect(stored).toMatchObject({
      activityId: activityDocumentId,
      stableActivityId: activityId,
      score: 1,
      maxScore: 1,
      attemptOrdinal: 1,
      submissionData: expect.objectContaining({ activityId, mode, status: 'graded' }),
    });

    const route = opaqueRoute(ctx);
    const foreign = await opaqueRoute(ctx, OTHER_LEARNER_ID as Id<'profiles'>).POST(
      opaqueRequest({ submissionId: created.submissionId }),
    );
    expect(foreign.status).toBe(404);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    const first = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: 'new',
      decision: expect.objectContaining({
        reason: 'eligible',
        masteryBearing: true,
      }),
    }));
    const storedEvidence = rows.learning_evidence.find((row) => row.submissionId === created.submissionId);
    expect(storedEvidence).toMatchObject({
      submissionId: created.submissionId,
      nodeId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
      activityId,
      origin: 'mastery_advantage',
      mode,
      attemptOrdinal: 1,
      occurredAt: stored.submittedAt,
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
    });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_cards[0]).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
      problemFamilyId: activityId,
    });
    expect(rows.srs_review_log).toHaveLength(1);
    expect(rows.srs_review_log[0]).toMatchObject({
      studentId: LEARNER_ID,
      submissionId: created.submissionId,
    });

    const traceAfterFirstDelivery = [...trace];
    const replay = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(replay.status).toBe(200);
    await expect(replay.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      delivery: 'replay',
    }));
    expect(trace).toEqual(traceAfterFirstDelivery);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.learning_evidence).toHaveLength(3);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
  });

  it('waits for a graph average-rate Worked exposure before persisting mastery evidence', async () => {
    const producer = await loadTopic12GraphSubmissionHandler();
    const { ctx, rows, trace } = createConvexHarness();
    const submissionData = makeTopic12GraphSubmission('guided_practice');
    const created = await producer(ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_GUIDED_ACTIVITY_ID,
      submissionData,
      idempotencyKey: 'precalc-topic-1-2-graph-awaiting-exposure',
    });

    const response = await opaqueRoute(ctx).POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: expect.objectContaining({
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      }),
    }));
    expect(trace).toEqual(['activity_submissions:insert']);
    expect(rows.learning_evidence).toHaveLength(1);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
  });

  it.each([
    ['Guided', 'guided_practice' as const],
    ['Independent', 'independent_practice' as const],
  ])('delivers an Example 4 %s submission to exact-node evidence and one replay-safe SRS effect', async (
    _label,
    mode,
  ) => {
    const producer = await loadTopic12NegativeRateContextSubmissionHandler();
    const { ctx, rows, trace } = createConvexHarness();
    const activityId = mode === 'guided_practice'
      ? PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID
      : PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID;
    const activityDocumentId = `activities:precalc-topic-1-2-negative-rate-${mode}`;
    const gradingConfig = mode === 'guided_practice'
      ? PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_GRADING_CONFIG;
    const submissionData = makeTopic12NegativeRateContextSubmission(mode);
    const selectedOptionId = (submissionData.answers as { selectedOptionId: string }).selectedOptionId;

    rows.activities.push({
      _id: activityDocumentId,
      stableActivityId: activityId,
      componentKey: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_COMPONENT_KEY,
      displayName: `Topic 1.2 negative-rate context ${mode}`,
      props: { presentationMode: mode },
      gradingConfig,
      createdAt: 1,
      updatedAt: 1,
    });
    rows.learning_evidence.push({
      _id: `learning_evidence:precalc-production-flow-negative-rate-${mode}-teacher-exposure`,
      learnerId: LEARNER_ID,
      nodeId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: Date.parse('2026-08-19T09:30:00.000Z'),
      idempotencyKey: `precalc-production-flow-negative-rate-${mode}-teacher-exposure`,
      createdAt: 1,
    });

    const created = await producer(ctx, {
      userId: LEARNER_ID,
      activityId,
      submissionData,
      idempotencyKey: `precalc-negative-rate-${mode}-create-1`,
    });
    const stored = rows.activity_submissions[0]!;

    expect(created).toMatchObject({
      score: 1,
      maxScore: 1,
      attemptOrdinal: 1,
      feedback: '1/1 negative-rate context selections matched the server rubric.',
    });
    expect(stored).toMatchObject({
      activityId: activityDocumentId,
      stableActivityId: activityId,
      score: 1,
      maxScore: 1,
      attemptOrdinal: 1,
      submittedAt: expect.any(Number),
      submissionData: {
        activityId,
        mode,
        status: 'graded',
        attemptNumber: 1,
        answers: { selectedOptionId },
        parts: [{
          partId: 'selectedOptionId',
          rawAnswer: selectedOptionId,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        }],
      },
    });
    const storedSubmissionData = stored.submissionData as { submittedAt: string };
    expect(Date.parse(storedSubmissionData.submittedAt)).toBe(stored.submittedAt);

    const route = opaqueRoute(ctx);
    const traceAfterCreate = [...trace];
    const foreign = await opaqueRoute(ctx, OTHER_LEARNER_ID as Id<'profiles'>).POST(
      opaqueRequest({ submissionId: created.submissionId }),
    );
    expect(foreign.status).toBe(404);
    expect(trace).toEqual(traceAfterCreate);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    const first = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: 'new',
      decision: expect.objectContaining({
        reason: 'eligible',
        masteryBearing: true,
      }),
    }));
    const storedEvidence = rows.learning_evidence.find((row) => row.submissionId === created.submissionId);
    expect(storedEvidence).toMatchObject({
      submissionId: created.submissionId,
      nodeId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
      activityId,
      origin: 'mastery_advantage',
      mode,
      attemptOrdinal: 1,
      occurredAt: stored.submittedAt,
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
      idempotencyKey: `precalc:mastery-advantage:submission:${created.submissionId}`,
    });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_cards[0]).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
      problemFamilyId: activityId,
    });
    expect(rows.srs_review_log).toHaveLength(1);
    expect(rows.srs_review_log[0]).toMatchObject({
      studentId: LEARNER_ID,
      submissionId: created.submissionId,
    });

    const traceAfterFirstDelivery = [...trace];
    const replay = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(replay.status).toBe(200);
    await expect(replay.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      delivery: 'replay',
    }));
    expect(trace).toEqual(traceAfterFirstDelivery);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.learning_evidence).toHaveLength(3);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
  });

  it.each([
    ['Guided', 'guided_practice'],
    ['Independent', 'independent_practice'],
  ] as const)('delivers a pointwise least-rate %s submission to exact-node evidence and one replay-safe SRS effect', async (
    _label,
    mode,
  ) => {
    const producer = await loadTopic12PointwiseSubmissionHandler();
    const { ctx, rows, trace } = createConvexHarness(false, false, false, true);
    const submissionData = makeTopic12PointwiseSubmission(mode);
    const activityId = mode === 'guided_practice'
      ? PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID
      : PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_INDEPENDENT_ACTIVITY_ID;
    const activityDocumentId = mode === 'guided_practice'
      ? TOPIC_12_POINTWISE_GUIDED_ACTIVITY_DOCUMENT_ID
      : TOPIC_12_POINTWISE_INDEPENDENT_ACTIVITY_DOCUMENT_ID;

    const created = await producer(ctx, {
      userId: LEARNER_ID,
      activityId,
      submissionData,
      idempotencyKey: 'precalc-topic-1-2-pointwise-' + mode + '-create-1',
    });
    const stored = rows.activity_submissions[0]!;

    expect(created).toMatchObject({ score: 1, maxScore: 1, attemptOrdinal: 1 });
    expect(stored).toMatchObject({
      activityId: activityDocumentId,
      stableActivityId: activityId,
      score: 1,
      maxScore: 1,
      attemptOrdinal: 1,
      submissionData: expect.objectContaining({ activityId, mode, status: 'graded' }),
    });

    const route = opaqueRoute(ctx);
    const foreign = await opaqueRoute(ctx, OTHER_LEARNER_ID as Id<'profiles'>).POST(
      opaqueRequest({ submissionId: created.submissionId }),
    );
    expect(foreign.status).toBe(404);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    const first = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: 'new',
      decision: expect.objectContaining({
        reason: 'eligible',
        masteryBearing: true,
      }),
    }));
    const storedEvidence = rows.learning_evidence.find((row) => row.submissionId === created.submissionId);
    expect(storedEvidence).toMatchObject({
      submissionId: created.submissionId,
      nodeId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
      activityId,
      origin: 'mastery_advantage',
      mode,
      attemptOrdinal: 1,
      occurredAt: stored.submittedAt,
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
    });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_cards[0]).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
      problemFamilyId: activityId,
    });
    expect(rows.srs_review_log).toHaveLength(1);
    expect(rows.srs_review_log[0]).toMatchObject({
      studentId: LEARNER_ID,
      submissionId: created.submissionId,
    });

    const traceAfterFirstDelivery = [...trace];
    const replay = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(replay.status).toBe(200);
    await expect(replay.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      delivery: 'replay',
    }));
    expect(trace).toEqual(traceAfterFirstDelivery);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
  });

  it.each([
    ['Guided', 'guided_practice'],
    ['Independent', 'independent_practice'],
  ] as const)('delivers a pointwise rate-ordering %s submission to exact-node evidence and one replay-safe SRS effect', async (
    _label,
    mode,
  ) => {
    const producer = await loadTopic12PointwiseOrderingSubmissionHandler();
    const { ctx, rows, trace } = createConvexHarness(false, false, false, false, true);
    const submissionData = makeTopic12PointwiseOrderingSubmission(mode);
    const activityId = mode === 'guided_practice'
      ? PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID
      : PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_INDEPENDENT_ACTIVITY_ID;
    const activityDocumentId = mode === 'guided_practice'
      ? TOPIC_12_POINTWISE_ORDERING_GUIDED_ACTIVITY_DOCUMENT_ID
      : TOPIC_12_POINTWISE_ORDERING_INDEPENDENT_ACTIVITY_DOCUMENT_ID;
    const expectedOrder = (submissionData.answers as { orderedPointIds: string[] }).orderedPointIds;

    const created = await producer(ctx, {
      userId: LEARNER_ID,
      activityId,
      submissionData,
      idempotencyKey: 'precalc-topic-1-2-pointwise-ordering-' + mode + '-create-1',
    });
    const stored = rows.activity_submissions[0]!;

    expect(created).toMatchObject({ score: 1, maxScore: 1, attemptOrdinal: 1 });
    expect(stored).toMatchObject({
      activityId: activityDocumentId,
      stableActivityId: activityId,
      score: 1,
      maxScore: 1,
      attemptOrdinal: 1,
      submissionData: {
        activityId,
        mode,
        status: 'graded',
        attemptNumber: 1,
        answers: { orderedPointIds: expectedOrder },
        parts: [{
          partId: 'orderedPointIds',
          rawAnswer: expectedOrder,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        }],
      },
    });
    expect((stored.submissionData as Record<string, unknown>).submittedAt).toBe(
      new Date(stored.submittedAt as number).toISOString(),
    );
    expect(stored.createIdempotencyKey).toBe('precalc-topic-1-2-pointwise-ordering-' + mode + '-create-1');

    const route = opaqueRoute(ctx);
    const foreign = await opaqueRoute(ctx, OTHER_LEARNER_ID as Id<'profiles'>).POST(
      opaqueRequest({ submissionId: created.submissionId }),
    );
    expect(foreign.status).toBe(404);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    const first = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: 'new',
      decision: expect.objectContaining({
        reason: 'eligible',
        masteryBearing: true,
      }),
    }));
    const storedEvidence = rows.learning_evidence.find((row) => row.submissionId === created.submissionId);
    expect(storedEvidence).toMatchObject({
      submissionId: created.submissionId,
      nodeId: PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
      activityId,
      origin: 'mastery_advantage',
      mode,
      attemptOrdinal: 1,
      occurredAt: stored.submittedAt,
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
    });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_cards[0]).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
      problemFamilyId: activityId,
    });
    expect(rows.srs_review_log).toHaveLength(1);
    expect(rows.srs_review_log[0]).toMatchObject({
      studentId: LEARNER_ID,
      submissionId: created.submissionId,
    });

    const traceAfterFirstDelivery = [...trace];
    const replay = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(replay.status).toBe(200);
    await expect(replay.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      delivery: 'replay',
    }));
    expect(trace).toEqual(traceAfterFirstDelivery);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.learning_evidence).toHaveLength(3);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
  });

  it('waits for a pointwise rate-ordering Worked exposure before persisting mastery evidence', async () => {
    const producer = await loadTopic12PointwiseOrderingSubmissionHandler();
    const { ctx, rows, trace } = createConvexHarness(false, false, false, true, false);
    expect(rows.learning_evidence).toEqual(expect.arrayContaining([
      expect.objectContaining({
        nodeId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
        origin: 'teacher_led',
        mode: 'worked_example',
      }),
    ]));
    expect(rows.learning_evidence.some((row) => (
      row.nodeId === PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID
      && row.origin === 'teacher_led'
    ))).toBe(false);
    const submissionData = makeTopic12PointwiseOrderingSubmission('guided_practice');
    const created = await producer(ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_GUIDED_ACTIVITY_ID,
      submissionData,
      idempotencyKey: 'precalc-topic-1-2-pointwise-ordering-awaiting-exposure',
    });

    const response = await opaqueRoute(ctx).POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: expect.objectContaining({
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      }),
    }));
    expect(trace).toEqual(['activity_submissions:insert']);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
  });

  it('converts the stored pointwise rate-ordering Worked review to exact-node teacher exposure without SRS effects', async () => {
    const producer = await loadTopic12PointwiseOrderingWorkedSubmissionHandler();
    const consume = await loadTopic12PointwiseOrderingWorkedEvidenceHandler();
    const harness = createConvexHarness();
    const submissionData = makeTopic12PointwiseOrderingWorkedSubmission();
    const sourceOrder = [...(generateTopic12PointwiseRateOrderingOutput(0).expectedAnswer as {
      orderedPointIds: readonly string[];
    }).orderedPointIds];
    expect(sourceOrder).toStrictEqual(['B', 'C', 'A']);

    const created = await producer(harness.ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
      submissionData,
      idempotencyKey: 'precalc-topic-1-2-pointwise-ordering-worked-evidence-create-1',
    });
    const storedSubmission = harness.rows.activity_submissions[0]!;

    expect(created).toStrictEqual({
      submissionId: 'activity_submissions:1',
      attemptOrdinal: 1,
      submittedAt: expect.any(String),
    });
    expect(storedSubmission).toMatchObject({
      _id: 'activity_submissions:1',
      activityId: TOPIC_12_POINTWISE_ORDERING_WORKED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      submittedAt: expect.any(Number),
      createIdempotencyKey: 'precalc-topic-1-2-pointwise-ordering-worked-evidence-create-1',
      submissionData: {
        activityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
        mode: 'worked_example',
        status: 'submitted',
        attemptNumber: 1,
        answers: { orderedPointIds: sourceOrder },
        parts: [{ partId: 'orderedPointIds', rawAnswer: sourceOrder }],
      },
    });
    expect(storedSubmission.masteryContractVersion).toBeUndefined();
    expect(storedSubmission.score).toBeUndefined();
    expect(storedSubmission.maxScore).toBeUndefined();
    expect(storedSubmission.feedback).toBeUndefined();
    expect(storedSubmission.gradedAt).toBeUndefined();

    const first = await consume(harness.ctx, {
      learnerId: LEARNER_ID,
      submissionId: created.submissionId,
    });
    expect(first).toStrictEqual({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(harness.rows.learning_evidence).toHaveLength(2);
    expect(harness.rows.learning_evidence[1]).toStrictEqual(expect.objectContaining({
      learnerId: LEARNER_ID,
      nodeId: PRECALCULUS_TOPIC_12_POINTWISE_COMPARISON_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
      attemptOrdinal: storedSubmission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: storedSubmission.submittedAt,
      idempotencyKey: `precalc:topic-1-2-pointwise-ordering:teacher-led:submission:${created.submissionId}`,
    }));
    expect(harness.rows.learning_evidence[1]!.gradedEvidence).toBeUndefined();
    expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
    expect(harness.rows.srs_cards).toHaveLength(0);
    expect(harness.rows.srs_review_log).toHaveLength(0);
    expect(harness.trace).toEqual(['activity_submissions:insert', 'learning_evidence:insert']);

    const traceAfterFirst = [...harness.trace];
    await expect(consume(harness.ctx, {
      learnerId: LEARNER_ID,
      submissionId: created.submissionId,
    })).resolves.toStrictEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'replay',
      decision: {
        idempotency: 'replay',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(harness.trace).toEqual(traceAfterFirst);
    expect(harness.rows.learning_evidence).toHaveLength(2);

    await expect(consume(harness.ctx, {
      learnerId: OTHER_LEARNER_ID,
      submissionId: created.submissionId,
    })).resolves.toStrictEqual({ accepted: false, reason: 'submission_not_found' });
    expect(harness.trace).toEqual(traceAfterFirst);
    expect(harness.rows.learning_evidence).toHaveLength(2);
  });

  it.each([
    ['a wrong activity document', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.activityId = 'activities:wrong-topic-1-2-pointwise-ordering-worked';
    }],
    ['a wrong stable activity ID', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.stableActivityId = `${PRECALCULUS_PILOT_NODE_ID}.worked_example`;
    }],
    ['a wrong component', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activities.find((row) => row._id === TOPIC_12_POINTWISE_ORDERING_WORKED_ACTIVITY_DOCUMENT_ID)!.componentKey = 'wrong-component';
    }],
    ['a wrong presentation mode', (harness: ReturnType<typeof createConvexHarness>) => {
      const activity = harness.rows.activities.find((row) => row._id === TOPIC_12_POINTWISE_ORDERING_WORKED_ACTIVITY_DOCUMENT_ID)!;
      (activity.props as Record<string, unknown>).presentationMode = 'guided_practice';
    }],
    ['a wrong generator key', (harness: ReturnType<typeof createConvexHarness>) => {
      const activity = harness.rows.activities.find((row) => row._id === TOPIC_12_POINTWISE_ORDERING_WORKED_ACTIVITY_DOCUMENT_ID)!;
      (activity.gradingConfig as Record<string, unknown>).generatorKey = 'wrong-generator';
    }],
    ['an extra grading config key', (harness: ReturnType<typeof createConvexHarness>) => {
      const activity = harness.rows.activities.find((row) => row._id === TOPIC_12_POINTWISE_ORDERING_WORKED_ACTIVITY_DOCUMENT_ID)!;
      (activity.gradingConfig as Record<string, unknown>).extra = true;
    }],
    ['a wrong seed', (harness: ReturnType<typeof createConvexHarness>) => {
      const activity = harness.rows.activities.find((row) => row._id === TOPIC_12_POINTWISE_ORDERING_WORKED_ACTIVITY_DOCUMENT_ID)!;
      (activity.gradingConfig as Record<string, unknown>).variantSeed = 1;
    }],
    ['a wrong mode', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.mode = 'guided_practice';
    }],
    ['a wrong status', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.status = 'graded';
    }],
    ['a coherent wrong permutation', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      const wrongOrder = ['A', 'B', 'C'];
      (data.answers as Record<string, unknown>).orderedPointIds = wrongOrder;
      (data.parts as Array<Record<string, unknown>>)[0]!.rawAnswer = wrongOrder;
    }],
    ['an extra envelope field', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.extra = 'forged';
    }],
    ['an extra answer field', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      (data.answers as Record<string, unknown>).score = 1;
    }],
    ['an extra part field', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      (data.parts as Array<Record<string, unknown>>)[0]!.isCorrect = true;
    }],
    ['a timestamp mismatch', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.submittedAt = Date.parse('2026-08-19T15:31:00.000Z');
    }],
    ['an ordinal mismatch', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.attemptOrdinal = 2;
    }],
    ['an invalid ordinal', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.attemptOrdinal = 0;
    }],
    ['a mastery contract field', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.masteryContractVersion = 'learning-evidence.v1';
    }],
    ['a score field', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.score = 1;
    }],
    ['a max score field', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.maxScore = 1;
    }],
    ['a feedback field', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.feedback = 'forged';
    }],
    ['a graded-at field', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.gradedAt = 1;
    }],
  ] as const)('rejects a corrupt pointwise rate-ordering Worked review with %s before writing teacher exposure', async (_label, corrupt) => {
    const producer = await loadTopic12PointwiseOrderingWorkedSubmissionHandler();
    const consume = await loadTopic12PointwiseOrderingWorkedEvidenceHandler();
    const harness = createConvexHarness();
    const created = await producer(harness.ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
      submissionData: makeTopic12PointwiseOrderingWorkedSubmission(),
      idempotencyKey: `precalc-topic-1-2-pointwise-ordering-worked-invalid-${_label.replaceAll(' ', '-')}`,
    });
    corrupt(harness);

    await expect(consume(harness.ctx, {
      learnerId: LEARNER_ID,
      submissionId: created.submissionId,
    })).resolves.toStrictEqual({ accepted: false, reason: 'submission_not_found' });
    expect(harness.rows.learning_evidence).toHaveLength(1);
    expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
    expect(harness.rows.srs_cards).toHaveLength(0);
    expect(harness.rows.srs_review_log).toHaveLength(0);
  });

  it('waits for a pointwise least-rate Worked exposure before persisting mastery evidence', async () => {
    const producer = await loadTopic12PointwiseSubmissionHandler();
    const { ctx, rows, trace } = createConvexHarness();
    const submissionData = makeTopic12PointwiseSubmission('guided_practice');
    const created = await producer(ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
      submissionData,
      idempotencyKey: 'precalc-topic-1-2-pointwise-awaiting-exposure',
    });

    const response = await opaqueRoute(ctx).POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: expect.objectContaining({
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      }),
    }));
    expect(trace).toEqual(['activity_submissions:insert']);
    expect(rows.learning_evidence).toHaveLength(1);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
  });

  it('converts the stored Topic 1.2 Worked review to teacher exposure without SRS effects', async () => {
    const producer = await loadTopic12WorkedSubmissionHandler();
    const consume = await loadTopic12WorkedEvidenceHandler();
    const { ctx, rows, trace } = createConvexHarness();
    const created = await producer(ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
      submissionData: makeTopic12WorkedSubmission(),
      idempotencyKey: 'precalc-topic-1-2-worked-evidence-create-1',
    });
    const storedSubmission = rows.activity_submissions[0]!;

    const first = await consume(ctx, {
      learnerId: LEARNER_ID,
      submissionId: created.submissionId,
    });
    expect(first).toStrictEqual({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence[1]).toStrictEqual(expect.objectContaining({
      learnerId: LEARNER_ID,
      nodeId: PRECALCULUS_TOPIC_12_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: storedSubmission.submittedAt,
      idempotencyKey: `precalc:topic-1-2:teacher-led:submission:${created.submissionId}`,
    }));
    expect(rows.learning_evidence[1]!.gradedEvidence).toBeUndefined();
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    expect(trace).toEqual(['activity_submissions:insert', 'learning_evidence:insert']);

    const traceAfterFirst = [...trace];
    await expect(consume(ctx, {
      learnerId: LEARNER_ID,
      submissionId: created.submissionId,
    })).resolves.toStrictEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'replay',
      decision: {
        idempotency: 'replay',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(trace).toEqual(traceAfterFirst);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    await expect(consume(ctx, {
      learnerId: OTHER_LEARNER_ID,
      submissionId: created.submissionId,
    })).resolves.toStrictEqual({
      accepted: false,
      reason: 'submission_not_found',
    });
    expect(trace).toEqual(traceAfterFirst);
    expect(rows.learning_evidence).toHaveLength(2);
  });

  it('converts the stored graph average-rate Worked review to exact-node teacher exposure without SRS effects', async () => {
    const producer = await loadTopic12GraphWorkedSubmissionHandler();
    const consume = await loadTopic12GraphWorkedEvidenceHandler();
    const { ctx, rows, trace } = createConvexHarness();
    const submissionData = makeTopic12GraphWorkedSubmission();
    expect(generateTopic12GraphAverageRateChoice(0).correctOptionId).toBe('C');
    const created = await producer(ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
      submissionData,
      idempotencyKey: 'precalc-topic-1-2-graph-worked-evidence-create-1',
    });
    const storedSubmission = rows.activity_submissions[0]!;

    expect(created).toStrictEqual({
      submissionId: 'activity_submissions:1',
      attemptOrdinal: 1,
      submittedAt: expect.any(String),
    });
    expect(storedSubmission).toMatchObject({
      activityId: TOPIC_12_GRAPH_WORKED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      submittedAt: expect.any(Number),
      submissionData: {
        activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
        mode: 'worked_example',
        status: 'submitted',
        answers: { selectedOptionId: 'C' },
        parts: [{ partId: 'selectedOptionId', rawAnswer: 'C' }],
      },
    });
    expect(storedSubmission.masteryContractVersion).toBeUndefined();
    expect(storedSubmission.score).toBeUndefined();
    expect(storedSubmission.maxScore).toBeUndefined();
    expect(storedSubmission.feedback).toBeUndefined();
    expect(storedSubmission.gradedAt).toBeUndefined();

    const first = await consume(ctx, {
      learnerId: LEARNER_ID,
      submissionId: created.submissionId,
    });
    expect(first).toStrictEqual({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence[1]).toStrictEqual(expect.objectContaining({
      learnerId: LEARNER_ID,
      nodeId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
      attemptOrdinal: storedSubmission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: storedSubmission.submittedAt,
      idempotencyKey: `precalc:topic-1-2-graph:teacher-led:submission:${created.submissionId}`,
    }));
    expect(rows.learning_evidence[1]!.gradedEvidence).toBeUndefined();
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    expect(trace).toEqual(['activity_submissions:insert', 'learning_evidence:insert']);

    const traceAfterFirst = [...trace];
    await expect(consume(ctx, {
      learnerId: LEARNER_ID,
      submissionId: created.submissionId,
    })).resolves.toStrictEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'replay',
      decision: {
        idempotency: 'replay',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(trace).toEqual(traceAfterFirst);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    await expect(consume(ctx, {
      learnerId: OTHER_LEARNER_ID,
      submissionId: created.submissionId,
    })).resolves.toStrictEqual({ accepted: false, reason: 'submission_not_found' });
    expect(trace).toEqual(traceAfterFirst);
    expect(rows.learning_evidence).toHaveLength(2);
  });

  it('converts the stored pointwise least-rate Worked review to exact-node teacher exposure without SRS effects', async () => {
    const producer = await loadTopic12PointwiseWorkedSubmissionHandler();
    const consume = await loadTopic12PointwiseWorkedEvidenceHandler();
    const { ctx, rows, trace } = createConvexHarness();
    const submissionData = makeTopic12PointwiseWorkedSubmission();
    expect(generateTopic12PointwiseLeastRateChoice(0).correctOptionId).toBe('D');
    const created = await producer(ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
      submissionData,
      idempotencyKey: 'precalc-topic-1-2-pointwise-worked-evidence-create-1',
    });
    const storedSubmission = rows.activity_submissions[0]!;

    expect(created).toStrictEqual({
      submissionId: 'activity_submissions:1',
      attemptOrdinal: 1,
      submittedAt: expect.any(String),
    });
    expect(storedSubmission).toMatchObject({
      _id: 'activity_submissions:1',
      activityId: TOPIC_12_POINTWISE_WORKED_ACTIVITY_DOCUMENT_ID,
      stableActivityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      submittedAt: expect.any(Number),
      submissionData: {
        activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
        mode: 'worked_example',
        status: 'submitted',
        answers: { selectedOptionId: 'D' },
        parts: [{ partId: 'selectedOptionId', rawAnswer: 'D' }],
      },
    });
    expect(storedSubmission.masteryContractVersion).toBeUndefined();
    expect(storedSubmission.score).toBeUndefined();
    expect(storedSubmission.maxScore).toBeUndefined();
    expect(storedSubmission.feedback).toBeUndefined();
    expect(storedSubmission.gradedAt).toBeUndefined();

    const first = await consume(ctx, {
      learnerId: LEARNER_ID,
      submissionId: created.submissionId,
    });
    expect(first).toStrictEqual({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence[1]).toStrictEqual(expect.objectContaining({
      learnerId: LEARNER_ID,
      nodeId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
      attemptOrdinal: storedSubmission.attemptOrdinal,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: storedSubmission.submittedAt,
      idempotencyKey: `precalc:topic-1-2-pointwise:teacher-led:submission:${created.submissionId}`,
    }));
    expect(rows.learning_evidence[1]!.gradedEvidence).toBeUndefined();
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);
    expect(trace).toEqual(['activity_submissions:insert', 'learning_evidence:insert']);

    const traceAfterFirst = [...trace];
    await expect(consume(ctx, {
      learnerId: LEARNER_ID,
      submissionId: created.submissionId,
    })).resolves.toStrictEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'replay',
      decision: {
        idempotency: 'replay',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(trace).toEqual(traceAfterFirst);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    await expect(consume(ctx, {
      learnerId: OTHER_LEARNER_ID,
      submissionId: created.submissionId,
    })).resolves.toStrictEqual({ accepted: false, reason: 'submission_not_found' });
    expect(trace).toEqual(traceAfterFirst);
    expect(rows.learning_evidence).toHaveLength(2);
  });

  it('unlocks pointwise least-rate Guided practice after pointwise Worked exposure', async () => {
    const workedProducer = await loadTopic12PointwiseWorkedSubmissionHandler();
    const workedConsume = await loadTopic12PointwiseWorkedEvidenceHandler();
    const practiceProducer = await loadTopic12PointwiseSubmissionHandler();
    const { ctx, rows } = createConvexHarness();
    const workedCreated = await workedProducer(ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
      submissionData: makeTopic12PointwiseWorkedSubmission(),
      idempotencyKey: 'precalc-topic-1-2-pointwise-worked-unlock-create-1',
    });
    await expect(workedConsume(ctx, {
      learnerId: LEARNER_ID,
      submissionId: workedCreated.submissionId,
    })).resolves.toMatchObject({
      persisted: true,
      decision: expect.objectContaining({ reason: 'teacher_led', masteryBearing: false }),
    });

    const submissionData = makeTopic12PointwiseSubmission('guided_practice');
    const practiceCreated = await practiceProducer(ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
      submissionData,
      idempotencyKey: 'precalc-topic-1-2-pointwise-unlock-practice-create-1',
    });
    const response = await opaqueRoute(ctx).POST(opaqueRequest({ submissionId: practiceCreated.submissionId }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      delivery: 'new',
      decision: expect.objectContaining({ reason: 'eligible', masteryBearing: true }),
    }));
    const storedEvidence = rows.learning_evidence.find((row) => row.submissionId === practiceCreated.submissionId);
    expect(storedEvidence).toMatchObject({
      submissionId: practiceCreated.submissionId,
      nodeId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
      mode: 'guided_practice',
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
    });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_cards[0]).toMatchObject({
      objectiveId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_NODE_ID,
      problemFamilyId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_GUIDED_ACTIVITY_ID,
    });
    expect(rows.srs_review_log).toHaveLength(1);
    expect(rows.srs_review_log[0]).toMatchObject({ submissionId: practiceCreated.submissionId });
    expect(rows.learning_evidence.filter((row) => row.activityId === PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID)).toHaveLength(1);
  });

  it.each([
    ['a wrong activity document', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.activityId = 'activities:wrong-topic-1-2-pointwise-worked';
    }],
    ['a wrong stable activity ID', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.stableActivityId = `${PRECALCULUS_PILOT_NODE_ID}.worked_example`;
    }],
    ['a wrong component', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activities.find((row) => row._id === TOPIC_12_POINTWISE_WORKED_ACTIVITY_DOCUMENT_ID)!.componentKey = 'wrong-component';
    }],
    ['a wrong presentation mode', (harness: ReturnType<typeof createConvexHarness>) => {
      const activity = harness.rows.activities.find((row) => row._id === TOPIC_12_POINTWISE_WORKED_ACTIVITY_DOCUMENT_ID)!;
      (activity.props as Record<string, unknown>).presentationMode = 'guided_practice';
    }],
    ['a wrong generator key', (harness: ReturnType<typeof createConvexHarness>) => {
      const activity = harness.rows.activities.find((row) => row._id === TOPIC_12_POINTWISE_WORKED_ACTIVITY_DOCUMENT_ID)!;
      (activity.gradingConfig as Record<string, unknown>).generatorKey = 'wrong-generator';
    }],
    ['an extra grading config key', (harness: ReturnType<typeof createConvexHarness>) => {
      const activity = harness.rows.activities.find((row) => row._id === TOPIC_12_POINTWISE_WORKED_ACTIVITY_DOCUMENT_ID)!;
      (activity.gradingConfig as Record<string, unknown>).extra = true;
    }],
    ['a wrong seed', (harness: ReturnType<typeof createConvexHarness>) => {
      const activity = harness.rows.activities.find((row) => row._id === TOPIC_12_POINTWISE_WORKED_ACTIVITY_DOCUMENT_ID)!;
      (activity.gradingConfig as Record<string, unknown>).variantSeed = 1;
    }],
    ['a wrong mode', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.mode = 'guided_practice';
    }],
    ['a wrong status', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.status = 'graded';
    }],
    ['an extra envelope field', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.extra = 'forged';
    }],
    ['an extra answer field', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      (data.answers as Record<string, unknown>).score = 1;
    }],
    ['an extra part field', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      (data.parts as Array<Record<string, unknown>>)[0]!.isCorrect = true;
    }],
    ['an answer-part mismatch', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      (data.parts as Array<Record<string, unknown>>)[0]!.rawAnswer = 'C';
    }],
    ['a timestamp mismatch', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.submittedAt = Date.parse('2026-08-19T14:31:00.000Z');
    }],
    ['an ordinal mismatch', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.attemptOrdinal = 2;
    }],
    ['an invalid ordinal', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.attemptOrdinal = 0;
    }],
    ['a mastery contract field', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.masteryContractVersion = 'learning-evidence.v1';
    }],
    ['a score field', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.score = 1;
    }],
    ['a max score field', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.maxScore = 1;
    }],
    ['a feedback field', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.feedback = 'forged';
    }],
    ['a graded-at field', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.gradedAt = 1;
    }],
  ] as const)('rejects a corrupt pointwise least-rate Worked replay with %s before writing teacher exposure', async (_label, corrupt) => {
    const producer = await loadTopic12PointwiseWorkedSubmissionHandler();
    const consume = await loadTopic12PointwiseWorkedEvidenceHandler();
    const harness = createConvexHarness();
    const created = await producer(harness.ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_POINTWISE_LEAST_RATE_WORKED_ACTIVITY_ID,
      submissionData: makeTopic12PointwiseWorkedSubmission(),
      idempotencyKey: `precalc-topic-1-2-pointwise-worked-invalid-${_label.replaceAll(' ', '-')}`,
    });
    corrupt(harness);

    await expect(consume(harness.ctx, {
      learnerId: LEARNER_ID,
      submissionId: created.submissionId,
    })).resolves.toStrictEqual({
      accepted: false,
      reason: 'submission_not_found',
    });
    expect(harness.rows.learning_evidence).toHaveLength(1);
    expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
    expect(harness.rows.srs_cards).toHaveLength(0);
    expect(harness.rows.srs_review_log).toHaveLength(0);
  });

  it.each([
    ['a wrong activity document', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.activityId = 'activities:wrong-topic-1-2-graph-worked';
    }],
    ['a wrong stable activity ID', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.stableActivityId = `${PRECALCULUS_PILOT_NODE_ID}.worked_example`;
    }],
    ['a wrong component', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activities.find((row) => row._id === TOPIC_12_GRAPH_WORKED_ACTIVITY_DOCUMENT_ID)!.componentKey = 'wrong-component';
    }],
    ['a wrong presentation mode', (harness: ReturnType<typeof createConvexHarness>) => {
      const activity = harness.rows.activities.find((row) => row._id === TOPIC_12_GRAPH_WORKED_ACTIVITY_DOCUMENT_ID)!;
      (activity.props as Record<string, unknown>).presentationMode = 'guided_practice';
    }],
    ['a wrong generator key', (harness: ReturnType<typeof createConvexHarness>) => {
      const activity = harness.rows.activities.find((row) => row._id === TOPIC_12_GRAPH_WORKED_ACTIVITY_DOCUMENT_ID)!;
      (activity.gradingConfig as Record<string, unknown>).generatorKey = 'wrong-generator';
    }],
    ['an extra grading config key', (harness: ReturnType<typeof createConvexHarness>) => {
      const activity = harness.rows.activities.find((row) => row._id === TOPIC_12_GRAPH_WORKED_ACTIVITY_DOCUMENT_ID)!;
      (activity.gradingConfig as Record<string, unknown>).extra = true;
    }],
    ['a wrong seed', (harness: ReturnType<typeof createConvexHarness>) => {
      const activity = harness.rows.activities.find((row) => row._id === TOPIC_12_GRAPH_WORKED_ACTIVITY_DOCUMENT_ID)!;
      (activity.gradingConfig as Record<string, unknown>).variantSeed = 1;
    }],
    ['a wrong mode', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.mode = 'guided_practice';
    }],
    ['a wrong status', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.status = 'graded';
    }],
    ['an extra envelope field', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.extra = 'forged';
    }],
    ['an extra answer field', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      (data.answers as Record<string, unknown>).score = 1;
    }],
    ['an extra part field', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      (data.parts as Array<Record<string, unknown>>)[0]!.isCorrect = true;
    }],
    ['an answer-part mismatch', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      (data.parts as Array<Record<string, unknown>>)[0]!.rawAnswer = 'D';
    }],
    ['a timestamp mismatch', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.submittedAt = Date.parse('2026-08-19T13:31:00.000Z');
    }],
    ['an ordinal mismatch', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.attemptOrdinal = 2;
    }],
    ['an invalid ordinal', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.attemptOrdinal = 0;
    }],
    ['a mastery contract field', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.masteryContractVersion = 'learning-evidence.v1';
    }],
    ['a score field', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.score = 1;
    }],
    ['a max score field', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.maxScore = 1;
    }],
    ['a feedback field', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.feedback = 'forged';
    }],
    ['a graded-at field', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.gradedAt = 1;
    }],
  ] as const)('rejects a corrupt graph Worked replay with %s before writing teacher exposure', async (_label, corrupt) => {
    const producer = await loadTopic12GraphWorkedSubmissionHandler();
    const consume = await loadTopic12GraphWorkedEvidenceHandler();
    const harness = createConvexHarness();
    const created = await producer(harness.ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_GRAPH_AVERAGE_RATE_WORKED_ACTIVITY_ID,
      submissionData: makeTopic12GraphWorkedSubmission(),
      idempotencyKey: `precalc-topic-1-2-graph-worked-invalid-${_label.replaceAll(' ', '-')}`,
    });
    corrupt(harness);

    await expect(consume(harness.ctx, {
      learnerId: LEARNER_ID,
      submissionId: created.submissionId,
    })).resolves.toStrictEqual({
      accepted: false,
      reason: 'submission_not_found',
    });
    expect(harness.rows.learning_evidence).toHaveLength(1);
    expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
    expect(harness.rows.srs_cards).toHaveLength(0);
    expect(harness.rows.srs_review_log).toHaveLength(0);
  });

  it.each([
    ['a wrong activity document', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.activityId = 'activities:wrong-topic-1-2-worked';
    }],
    ['a wrong stable activity ID', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.stableActivityId = `${PRECALCULUS_PILOT_NODE_ID}.worked_example`;
    }],
    ['a wrong mode', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.mode = 'guided_practice';
    }],
    ['a wrong component', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activities.find((row) => row._id === TOPIC_12_WORKED_ACTIVITY_DOCUMENT_ID)!.componentKey = 'wrong-component';
    }],
    ['a wrong grading config', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activities.find((row) => row._id === TOPIC_12_WORKED_ACTIVITY_DOCUMENT_ID)!.gradingConfig = {
        generatorKey: 'topic12-table-average-rate-choice',
        variantSeed: 1,
      };
    }],
    ['a wrong presentation mode', (harness: ReturnType<typeof createConvexHarness>) => {
      const activity = harness.rows.activities.find((row) => row._id === TOPIC_12_WORKED_ACTIVITY_DOCUMENT_ID)!;
      (activity.props as Record<string, unknown>).presentationMode = 'guided_practice';
    }],
    ['a forged grade field', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.score = 1;
    }],
    ['an extra envelope field', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      data.extra = 'forged';
    }],
    ['an extra answer field', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      (data.answers as Record<string, unknown>).score = 1;
    }],
    ['an extra part field', (harness: ReturnType<typeof createConvexHarness>) => {
      const data = harness.rows.activity_submissions[0]!.submissionData as Record<string, unknown>;
      (data.parts as Array<Record<string, unknown>>)[0]!.isCorrect = true;
    }],
    ['a timestamp mismatch', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.submittedAt = Date.parse('2026-08-19T12:31:00.000Z');
    }],
    ['an ordinal mismatch', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.attemptOrdinal = 2;
    }],
    ['an invalid ordinal', (harness: ReturnType<typeof createConvexHarness>) => {
      harness.rows.activity_submissions[0]!.attemptOrdinal = 0;
    }],
  ] as const)('rejects replay of %s before writing Topic 1.2 teacher exposure', async (_label, corrupt) => {
    const producer = await loadTopic12WorkedSubmissionHandler();
    const consume = await loadTopic12WorkedEvidenceHandler();
    const harness = createConvexHarness();
    const created = await producer(harness.ctx, {
      userId: LEARNER_ID,
      activityId: PRECALCULUS_TOPIC_12_WORKED_ACTIVITY_ID,
      submissionData: makeTopic12WorkedSubmission(),
      idempotencyKey: `precalc-topic-1-2-worked-invalid-${_label.replaceAll(' ', '-')}`,
    });
    corrupt(harness);

    await expect(consume(harness.ctx, {
      learnerId: LEARNER_ID,
      submissionId: created.submissionId,
    })).resolves.toStrictEqual({
      accepted: false,
      reason: 'submission_not_found',
    });
    expect(harness.rows.learning_evidence).toHaveLength(1);
    expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
    expect(harness.rows.srs_cards).toHaveLength(0);
    expect(harness.rows.srs_review_log).toHaveLength(0);
  });

  it('projects an Independent-only SRS card into the exact Topic 1.1 node', async () => {
    const { ctx, rows, queryEvents } = createConvexHarness();
    rows.srs_cards.push({
      _id: 'srs_cards:independent-only',
      studentId: LEARNER_ID,
      objectiveId: PRECALCULUS_PILOT_NODE_ID,
      problemFamilyId: INDEPENDENT_ACTIVITY_ID,
      stability: 1,
      difficulty: 0.3,
      state: 'review',
      dueDate: '2026-08-22T12:00:00.000Z',
      elapsedDays: 1,
      scheduledDays: 1,
      reps: 1,
      lapses: 0,
      lastReview: '2026-08-21T12:00:00.000Z',
      createdAt: 1,
      updatedAt: 1,
    });

    const state = await getPrecalculusPilotKnowledgeStateHandler(ctx as unknown as QueryCtx, {
      learnerId: LEARNER_ID,
      now: KNOWLEDGE_STATE_NOW,
    });

    expect(queryEvents).toContain('srs_cards:by_student_and_objective');
    expect(state.nodeId).toBe(PRECALCULUS_PILOT_NODE_ID);
    expect(state.status).not.toBe('not_started');
  });

  it('ignores an unrelated SRS variant for the Topic 1.1 node', async () => {
    const { ctx, rows } = createConvexHarness();
    rows.srs_cards.push({
      _id: 'srs_cards:unrelated-variant',
      studentId: LEARNER_ID,
      objectiveId: PRECALCULUS_PILOT_NODE_ID,
      problemFamilyId: `${PRECALCULUS_PILOT_NODE_ID}.unrelated_variant`,
      stability: 1,
      difficulty: 0.3,
      state: 'review',
      dueDate: '2026-08-22T12:00:00.000Z',
      elapsedDays: 1,
      scheduledDays: 1,
      reps: 1,
      lapses: 0,
      lastReview: '2026-08-21T12:00:00.000Z',
      createdAt: 1,
      updatedAt: 1,
    });

    await expect(getPrecalculusPilotKnowledgeStateHandler(ctx as unknown as QueryCtx, {
      learnerId: LEARNER_ID,
      now: KNOWLEDGE_STATE_NOW,
    })).resolves.toMatchObject({
      nodeId: PRECALCULUS_PILOT_NODE_ID,
      status: 'not_started',
    });
  });

  it.each([
    ['Guided', 'guided_practice'],
    ['Independent', 'independent_practice'],
  ] as const)('delivers an Example 5 %s submission to exact-node evidence and one replay-safe SRS effect', async (
    _label,
    mode,
  ) => {
    const producer = await loadTopic12QuadraticNegativeRateIntervalSubmissionHandler();
    const { ctx, rows, trace } = createConvexHarness();
    const activityId = mode === 'guided_practice'
      ? PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID
      : PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID;
    const activityDocumentId = `activities:precalc-topic-1-2-quadratic-negative-rate-${mode}`;
    const gradingConfig = mode === 'guided_practice'
      ? PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_GRADING_CONFIG
      : PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_GRADING_CONFIG;
    const submissionData = makeTopic12QuadraticNegativeRateIntervalSubmission(mode);
    const selectedOptionId = (submissionData.answers as { selectedOptionId: string }).selectedOptionId;

    rows.activities.push({
      _id: activityDocumentId,
      stableActivityId: activityId,
      componentKey: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_COMPONENT_KEY,
      displayName: `Topic 1.2 quadratic negative-rate interval ${mode}`,
      props: { presentationMode: mode },
      gradingConfig,
      createdAt: 1,
      updatedAt: 1,
    });
    rows.learning_evidence.push({
      _id: `learning_evidence:precalc-production-flow-quadratic-negative-rate-${mode}-teacher-exposure`,
      learnerId: LEARNER_ID,
      nodeId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
      activityId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: Date.parse('2026-08-19T09:30:00.000Z'),
      idempotencyKey: `precalc-production-flow-quadratic-negative-rate-${mode}-teacher-exposure`,
      createdAt: 1,
    });

    const created = await producer(ctx, {
      userId: LEARNER_ID,
      activityId,
      submissionData,
      idempotencyKey: `precalc-quadratic-negative-rate-${mode}-create-1`,
    });
    const stored = rows.activity_submissions[0]!;

    expect(created).toStrictEqual({
      submissionId: 'activity_submissions:1',
      score: 1,
      maxScore: 1,
      feedback: '1/1 quadratic negative-rate interval selections matched the server rubric.',
      attemptOrdinal: 1,
    });
    expect(stored).toMatchObject({
      _id: created.submissionId,
      userId: LEARNER_ID,
      activityId: activityDocumentId,
      stableActivityId: activityId,
      masteryContractVersion: 'learning-evidence.v1',
      score: 1,
      maxScore: 1,
      attemptOrdinal: 1,
      submissionData: {
        contractVersion: 'practice.v1',
        activityId,
        mode,
        status: 'graded',
        attemptNumber: 1,
        answers: { selectedOptionId },
        parts: [{
          partId: 'selectedOptionId',
          rawAnswer: selectedOptionId,
          isCorrect: true,
          score: 1,
          maxScore: 1,
        }],
      },
    });
    expect(typeof stored.submittedAt).toBe('number');
    expect(stored.gradedAt).toBe(stored.submittedAt);
    expect((stored.submissionData as Record<string, unknown>).submittedAt).toBe(
      new Date(stored.submittedAt as number).toISOString(),
    );

    const route = opaqueRoute(ctx);
    const traceAfterCreate = [...trace];
    const foreign = await opaqueRoute(ctx, OTHER_LEARNER_ID as Id<'profiles'>).POST(
      opaqueRequest({ submissionId: created.submissionId }),
    );
    expect(foreign.status).toBe(404);
    expect(trace).toEqual(traceAfterCreate);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.learning_evidence).toHaveLength(2);
    expect(rows.learning_evidence_receipts).toHaveLength(0);
    expect(rows.srs_cards).toHaveLength(0);
    expect(rows.srs_review_log).toHaveLength(0);

    const first = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: 'new',
      decision: expect.objectContaining({
        reason: 'eligible',
        masteryBearing: true,
      }),
    }));
    const storedEvidence = rows.learning_evidence.find((row) => row.submissionId === created.submissionId);
    expect(storedEvidence).toMatchObject({
      submissionId: created.submissionId,
      nodeId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
      activityId,
      origin: 'mastery_advantage',
      mode,
      attemptOrdinal: 1,
      occurredAt: stored.submittedAt,
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
      idempotencyKey: `precalc:mastery-advantage:submission:${created.submissionId}`,
    });
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_cards[0]).toMatchObject({
      studentId: LEARNER_ID,
      objectiveId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
      problemFamilyId: activityId,
    });
    expect(rows.srs_review_log).toHaveLength(1);
    expect(rows.srs_review_log[0]).toMatchObject({
      studentId: LEARNER_ID,
      submissionId: created.submissionId,
    });

    const traceAfterFirstDelivery = [...trace];
    const replay = await route.POST(opaqueRequest({ submissionId: created.submissionId }));
    expect(replay.status).toBe(200);
    await expect(replay.json()).resolves.toEqual(expect.objectContaining({
      persisted: true,
      masteryApplied: true,
      delivery: 'replay',
    }));
    expect(trace).toEqual(traceAfterFirstDelivery);
    expect(rows.activity_submissions).toHaveLength(1);
    expect(rows.learning_evidence).toHaveLength(3);
    expect(rows.learning_evidence_receipts).toHaveLength(1);
    expect(rows.srs_cards).toHaveLength(1);
    expect(rows.srs_review_log).toHaveLength(1);
  });
});
