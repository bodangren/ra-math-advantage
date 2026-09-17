import fs from 'node:fs';
import path from 'node:path';

import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearActivityRegistry, getActivityComponent } from '@math-platform/activity-components/registry';
import type { ProjectedActivity } from '@math-platform/knowledge-space-practice';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import { RendererPreview, getStudentPreviewProblem } from '@/app/(dev)/blueprint-qa/components/RendererPreview';
import { ensureActivitiesRegistered } from '@/app/(dev)/blueprint-qa/components/register-activities';
import { generateTopic14PolynomialEndBehaviorOutput } from '@math-platform/math-content/knowledge-space';

const NODE_ID = 'math.precalc.skill.1.4.determine-end-behavior-from-leading-term';
const SOURCE_FINAL_ANSWER = 'As x approaches negative infinity, f(x) approaches negative infinity. As x approaches positive infinity, f(x) approaches negative infinity.';
const GUIDED_STEPS = [
  'Identify whether the degree is even or odd.',
  'Identify whether the leading coefficient is positive or negative.',
  'Use the degree parity and leading-coefficient sign to determine both ends.',
] as const;
const GUIDED_FIELD_HELP = 'An even degree sends both ends in the same direction. An odd degree sends them in opposite directions. The leading coefficient determines the right end.';
const PART_IDS = ['leftEnd', 'rightEnd'] as const;
const BANNED_AUTHORITY_KEYS = new Set([
  'answer', 'answerKey', 'authority', 'correctAnswer', 'correctAnswers', 'correctness',
  'expectedAnswer', 'finalAnswer', 'grading', 'gradingMetadata', 'isCorrect', 'maxScore',
  'normalizedAnswer', 'score', 'solution', 'solutionSteps', 'steps',
]);
const AP_PROJECTION_PATH = path.resolve(
  process.cwd(),
  '../pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json',
);

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
        title: 'Determine polynomial end behavior from the leading term',
        domain: 'math.precalc',
        reviewStatus: 'draft',
        metadata: { course: 'precalc', unit: '1', lesson: '4' },
      }}
      activity={activity}
      onIntercept={onIntercept}
    />,
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
  answers: Record<string, string>,
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

describe('Business Math QA polynomial-end-behavior registration', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    const calls = consoleError.mock.calls;
    consoleError.mockRestore();
    expect(calls).toEqual([]);
  });

  it('registers and previews all exact Topic 1.4 Example 4 modes', async () => {
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
    expect(getActivityComponent('polynomial-end-behavior')).toBeTruthy();
    for (const activity of activities) expect(getStudentPreviewProblem(activity)).toBeNull();

    const worked = activities[0]!;
    const workedIntercept = vi.fn();
    const workedView = renderPreview(worked, workedIntercept);
    const workedOutput = generateTopic14PolynomialEndBehaviorOutput(0);
    expect(await screen.findByRole('heading', { name: 'Worked Example: Polynomial End Behavior' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(worked.props).toEqual({
      ...asRendererProps(workedOutput.data.rendererProps),
      presentationMode: 'worked_example',
      correctAnswers: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps.map((step) => step.description),
      finalAnswer: SOURCE_FINAL_ANSWER,
    });
    expect(screen.getByLabelText('Leading term -3x^4')).toBeInTheDocument();
    expect(screen.getByLabelText('Leading term -3x^4').querySelector('sup')).toHaveTextContent('4');
    expect(screen.getAllByText('Negative infinity')).toHaveLength(2);
    for (const step of workedOutput.solutionSteps) expect(screen.getByText(step.description)).toBeInTheDocument();
    expect(screen.getByText(SOURCE_FINAL_ANSWER)).toBeInTheDocument();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();
    expect(workedIntercept).not.toHaveBeenCalled();
    workedView.unmount();

    const guided = activities[1]!;
    const guidedIntercept = vi.fn();
    const guidedView = renderPreview(guided, guidedIntercept);
    const guidedOutput = generateTopic14PolynomialEndBehaviorOutput(1);
    expect(await screen.findByRole('heading', { name: 'Guided Practice: Polynomial End Behavior' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(guided.props).toEqual({
      ...asRendererProps(guidedOutput.data.rendererProps),
      presentationMode: 'guided_practice',
      guidedSteps: [...GUIDED_STEPS],
      fieldHelp: GUIDED_FIELD_HELP,
    });
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeInTheDocument();
    expect(screen.getByText(GUIDED_FIELD_HELP)).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expectNoAuthority(guided.props);
    const guidedSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(guidedSubmit).toBeDisabled();
    const leftGroup = screen.getByRole('group', { name: 'As x approaches negative infinity, what does f(x) approach?' });
    const rightGroup = screen.getByRole('group', { name: 'As x approaches positive infinity, what does f(x) approach?' });
    fireEvent.click(within(leftGroup).getByRole('radio', { name: 'Negative infinity' }));
    fireEvent.click(within(rightGroup).getByRole('radio', { name: 'Negative infinity' }));
    expect(guidedSubmit).toBeEnabled();
    fireEvent.click(guidedSubmit);
    expect(guidedIntercept).toHaveBeenCalledTimes(1);
    const guidedPayload = guidedIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expectPracticeEnvelope(guidedPayload, guided.stableActivityId, 'guided_practice', {
      leftEnd: 'negative_infinity',
      rightEnd: 'negative_infinity',
    });
    expectNoAuthority(guidedPayload);
    guidedView.unmount();

    const independent = activities[2]!;
    const independentIntercept = vi.fn();
    const independentView = renderPreview(independent, independentIntercept);
    const independentOutput = generateTopic14PolynomialEndBehaviorOutput(2);
    expect(await screen.findByRole('heading', { name: 'Independent Practice: Polynomial End Behavior' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(independent.props).toEqual({ ...asRendererProps(independentOutput.data.rendererProps), presentationMode: 'independent_practice' });
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(GUIDED_FIELD_HELP)).toBeNull();
    expect(screen.queryByText(SOURCE_FINAL_ANSWER)).toBeNull();
    expectNoAuthority(independent.props);
    const independentSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(independentSubmit).toBeDisabled();
    const independentGroups = screen.getAllByRole('group');
    fireEvent.click(within(independentGroups[0]!).getByRole('radio', { name: 'Positive infinity' }));
    fireEvent.click(within(independentGroups[1]!).getByRole('radio', { name: 'Positive infinity' }));
    expect(independentSubmit).toBeEnabled();
    fireEvent.click(independentSubmit);
    expect(independentIntercept).toHaveBeenCalledTimes(1);
    const independentPayload = independentIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expectPracticeEnvelope(independentPayload, independent.stableActivityId, 'independent_practice', {
      leftEnd: 'positive_infinity',
      rightEnd: 'positive_infinity',
    });
    expectNoAuthority(independentPayload);
    independentView.unmount();
  });
});

function asRendererProps(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected renderer props');
  return value as Record<string, unknown>;
}
