import fs from 'node:fs';
import path from 'node:path';

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearActivityRegistry, getActivityComponent } from '@math-platform/activity-components/registry';
import type { ProjectedActivity } from '@math-platform/knowledge-space-practice';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import { RendererPreview, getStudentPreviewProblem } from '@/app/(dev)/blueprint-qa/components/RendererPreview';
import { ensureActivitiesRegistered } from '@/app/(dev)/blueprint-qa/components/register-activities';
import { generateTopic15RealZerosAndMultiplicitiesOutput } from '@math-platform/math-content/knowledge-space';

const NODE_ID = 'math.precalc.skill.1.5.find-real-zeros-and-multiplicities-from-factored-form';
const AP_PROJECTION_PATH = path.resolve(
  process.cwd(),
  '../pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json',
);
const PART_IDS = ['a', 'b'] as const;
const BANNED_AUTHORITY_KEYS = new Set([
  'answer', 'answerKey', 'authority', 'correctAnswer', 'correctAnswers', 'correctness',
  'expectedAnswer', 'finalAnswer', 'grading', 'gradingMetadata', 'isCorrect', 'maxScore',
  'normalizedAnswer', 'score', 'solution', 'solutionSteps', 'steps',
]);

function loadActivities(): ProjectedActivity[] {
  const document = JSON.parse(fs.readFileSync(AP_PROJECTION_PATH, 'utf8')) as {
    activities: ProjectedActivity[];
  };
  return document.activities.filter((activity) => activity.nodeId === NODE_ID);
}

function makeState(activity: ProjectedActivity) {
  if (activity.mode === 'assessment') throw new Error('Assessment is not a student preview mode.');
  return {
    selectedNodeId: NODE_ID,
    seed: activity.mode === 'worked_example' ? 0 : activity.mode === 'guided_practice' ? 1 : 2,
    difficulty: 0.5,
    mode: activity.mode,
    generatorOutput: null,
    generatorError: null,
    lastSubmission: null,
  };
}

function renderPreview(activity: ProjectedActivity, onIntercept: (entry: { rawAnswer: unknown }) => void) {
  return render(
    <RendererPreview
      state={makeState(activity)}
      selectedNode={{
        id: NODE_ID,
        kind: 'skill',
        title: 'Find real zeros and multiplicities from factored form',
        domain: 'math.precalc',
        reviewStatus: 'draft',
        metadata: { course: 'precalc', unit: '1', lesson: '5' },
      }}
      activity={activity}
      onIntercept={onIntercept}
    />
  );
}

function collectObjectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((item) => collectObjectKeys(item, keys));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, nested]) => {
    keys.push(key);
    collectObjectKeys(nested, keys);
  });
  return keys;
}

function expectNoAuthority(value: unknown): void {
  expect(collectObjectKeys(value).filter((key) => BANNED_AUTHORITY_KEYS.has(key))).toEqual([]);
}

function expectPracticeEnvelope(
  payload: Record<string, unknown>,
  activityId: string,
  mode: 'guided_practice' | 'independent_practice',
  answers: Record<string, Array<{ zero: number; multiplicity: number }>>,
): void {
  expect(payload).toEqual({
    activityId,
    analytics: undefined,
    answers,
    artifact: undefined,
    attemptNumber: 1,
    contractVersion: 'practice.v1',
    interactionHistory: undefined,
    mode,
    parts: PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
    status: 'submitted',
    submittedAt: expect.any(String),
    studentFeedback: undefined,
    teacherSummary: undefined,
    timing: undefined,
  });
  expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
}

describe('Business Math QA real-zeros-and-multiplicities registration', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    const calls = consoleError.mock.calls;
    consoleError.mockRestore();
    expect(calls).toEqual([]);
  });

  it('registers and previews all exact Topic 1.5 Example 1 modes', async () => {
    const activities = loadActivities();
    expect(activities).toHaveLength(3);
    expect(activities.map((activity) => activity.mode)).toEqual([
      'worked_example', 'guided_practice', 'independent_practice',
    ]);
    expect(activities.map((activity) => activity.stableActivityId)).toEqual([
      `${NODE_ID}.worked_example`, `${NODE_ID}.guided_practice`, `${NODE_ID}.independent_practice`,
    ]);

    clearActivityRegistry();
    ensureActivitiesRegistered();
    expect(getActivityComponent('real-zeros-and-multiplicities')).toBeTruthy();
    for (const activity of activities) expect(getStudentPreviewProblem(activity)).toBeNull();

    const worked = activities[0]!;
    const workedIntercept = vi.fn();
    const workedView = renderPreview(worked, workedIntercept);
    const workedOutput = generateTopic15RealZerosAndMultiplicitiesOutput(0);
    const workedPublic = workedOutput.data.rendererProps as Record<string, unknown> & {
      items: Array<{ functionName: string; expression: string }>;
    };
    expect(await screen.findByRole('heading', { name: 'Worked Example: Real Zeros and Multiplicities' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(worked.props).toEqual({
      ...workedPublic,
      presentationMode: 'worked_example',
      correctAnswers: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps.map((step) => step.description),
      finalAnswer: 'For f, the real zeros are x = -1 (multiplicity 1), x = 0 (multiplicity 3), and x = 4 (multiplicity 2). For g, x = -2 (multiplicity 1) and x = 2 (multiplicity 5).',
    });
    for (const item of workedPublic.items) {
      expect(screen.getByLabelText(`${item.functionName}(x) = ${item.expression}`)).toBeInTheDocument();
      expect(screen.getByLabelText(`${item.functionName}(x) = ${item.expression}`).querySelector('sup')).toBeTruthy();
    }
    for (const pair of [
      ...(workedOutput.expectedAnswer.a as Array<{ zero: number; multiplicity: number }>),
      ...(workedOutput.expectedAnswer.b as Array<{ zero: number; multiplicity: number }>),
    ]) {
      expect(screen.getByText(`x = ${pair.zero} (multiplicity ${pair.multiplicity})`)).toBeInTheDocument();
    }
    for (const step of workedOutput.solutionSteps) expect(screen.getByText(step.description)).toBeInTheDocument();
    expect(screen.getByText('For f, the real zeros are x = -1 (multiplicity 1), x = 0 (multiplicity 3), and x = 4 (multiplicity 2). For g, x = -2 (multiplicity 1) and x = 2 (multiplicity 5).')).toBeInTheDocument();
    expect(screen.queryAllByRole('spinbutton')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();
    expect(workedIntercept).not.toHaveBeenCalled();
    workedView.unmount();

    const guided = activities[1]!;
    const guidedIntercept = vi.fn();
    const guidedView = renderPreview(guided, guidedIntercept);
    const guidedOutput = generateTopic15RealZerosAndMultiplicitiesOutput(1);
    const guidedPublic = guidedOutput.data.rendererProps as Record<string, unknown>;
    expect(await screen.findByRole('heading', { name: 'Guided Practice: Real Zeros and Multiplicities' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(guided.props).toEqual({
      ...guidedPublic,
      presentationMode: 'guided_practice',
      guidedSteps: [
        'Identify each factor that can make the function equal zero.',
        'Count the repeated factors for each zero.',
      ],
      fieldHelp: 'List the zeros in ascending order and give the multiplicity of each zero.',
    });
    expect(screen.getAllByRole('spinbutton')).toHaveLength(8);
    expect(screen.getByText('Identify each factor that can make the function equal zero.')).toBeInTheDocument();
    expect(screen.getByText('Count the repeated factors for each zero.')).toBeInTheDocument();
    expect(screen.getByText('List the zeros in ascending order and give the multiplicity of each zero.')).toBeInTheDocument();
    expectNoAuthority(guided.props);
    const guidedSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(guidedSubmit).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Add third row for f' }));
    const guidedValues = [
      ['Zero for f pair 1', '-1'], ['Multiplicity for f pair 1', '1'],
      ['Zero for f pair 2', '0'], ['Multiplicity for f pair 2', '3'],
      ['Zero for f pair 3', '4'], ['Multiplicity for f pair 3', '2'],
      ['Zero for g pair 1', '-2'], ['Multiplicity for g pair 1', '1'],
      ['Zero for g pair 2', '2'], ['Multiplicity for g pair 2', '5'],
    ] as const;
    for (const [label, value] of guidedValues) fireEvent.change(screen.getByLabelText(label), { target: { value } });
    expect(guidedSubmit).toBeEnabled();
    fireEvent.click(guidedSubmit);
    expect(guidedIntercept).toHaveBeenCalledOnce();
    const guidedPayload = guidedIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expectPracticeEnvelope(guidedPayload, guided.stableActivityId, 'guided_practice', {
      a: [{ zero: -1, multiplicity: 1 }, { zero: 0, multiplicity: 3 }, { zero: 4, multiplicity: 2 }],
      b: [{ zero: -2, multiplicity: 1 }, { zero: 2, multiplicity: 5 }],
    });
    expectNoAuthority(guidedPayload);
    guidedView.unmount();

    const independent = activities[2]!;
    const independentIntercept = vi.fn();
    const independentView = renderPreview(independent, independentIntercept);
    const independentOutput = generateTopic15RealZerosAndMultiplicitiesOutput(2);
    const independentPublic = independentOutput.data.rendererProps as Record<string, unknown>;
    expect(await screen.findByRole('heading', { name: 'Independent Practice: Real Zeros and Multiplicities' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(independent.props).toEqual(independentPublic);
    expect(screen.getAllByRole('spinbutton')).toHaveLength(8);
    expect(screen.queryByText('Identify each factor that can make the function equal zero.')).toBeNull();
    expect(screen.queryByText('Count the repeated factors for each zero.')).toBeNull();
    expect(screen.queryByText('List the zeros in ascending order and give the multiplicity of each zero.')).toBeNull();
    expect(screen.queryByText(/For f, the real zeros are/)).toBeNull();
    expectNoAuthority(independent.props);
    const independentSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(independentSubmit).toBeDisabled();
    const independentValues = [
      ['Zero for f pair 1', '-4'], ['Multiplicity for f pair 1', '2'],
      ['Zero for f pair 2', '0'], ['Multiplicity for f pair 2', '2'],
      ['Zero for g pair 1', '-3'], ['Multiplicity for g pair 1', '2'],
      ['Zero for g pair 2', '3'], ['Multiplicity for g pair 2', '3'],
    ] as const;
    for (const [label, value] of independentValues) fireEvent.change(screen.getByLabelText(label), { target: { value } });
    expect(independentSubmit).toBeEnabled();
    fireEvent.click(independentSubmit);
    expect(independentIntercept).toHaveBeenCalledOnce();
    const independentPayload = independentIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expectPracticeEnvelope(independentPayload, independent.stableActivityId, 'independent_practice', {
      a: [{ zero: -4, multiplicity: 2 }, { zero: 0, multiplicity: 2 }],
      b: [{ zero: -3, multiplicity: 2 }, { zero: 3, multiplicity: 3 }],
    });
    expectNoAuthority(independentPayload);
    independentView.unmount();
  });
});
