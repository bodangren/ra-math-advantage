import fs from 'node:fs';
import path from 'node:path';

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearActivityRegistry, getActivityComponent } from '@math-platform/activity-components/registry';
import type { ProjectedActivity } from '@math-platform/knowledge-space-practice';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import { RendererPreview, getStudentPreviewProblem } from '@/app/(dev)/blueprint-qa/components/RendererPreview';
import { ensureActivitiesRegistered } from '@/app/(dev)/blueprint-qa/components/register-activities';
import { generateTopic15LeastPolynomialDegreeOutput } from '@math-platform/math-content/knowledge-space';

const NODE_ID = 'math.precalc.skill.1.5.determine-least-polynomial-degree-from-zeros-and-conjugate-pairs';
const AP_PROJECTION_PATH = path.resolve(
  process.cwd(),
  '../pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json',
);
const PART_ID = 'leastDegree';
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
        title: 'Determine least polynomial degree from zeros and conjugate pairs',
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
  leastDegree: number,
): void {
  expect(payload).toEqual({
    activityId,
    analytics: undefined,
    answers: { leastDegree },
    artifact: undefined,
    attemptNumber: 1,
    contractVersion: 'practice.v1',
    interactionHistory: undefined,
    mode,
    parts: [{ partId: PART_ID, rawAnswer: leastDegree }],
    status: 'submitted',
    submittedAt: expect.any(String),
    studentFeedback: undefined,
    teacherSummary: undefined,
    timing: undefined,
  });
  expect(practiceSubmissionEnvelopeSchema.safeParse(payload).success).toBe(true);
}

describe('Business Math QA least-polynomial-degree registration', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    const calls = consoleError.mock.calls;
    consoleError.mockRestore();
    expect(calls).toEqual([]);
  });

  it('registers and previews all exact Topic 1.5 Example 2 modes', async () => {
    const activities = loadActivities();
    expect(activities).toHaveLength(3);
    expect(activities.map((activity) => activity.mode)).toEqual([
      'worked_example', 'guided_practice', 'independent_practice',
    ]);
    expect(activities.map((activity) => activity.stableActivityId)).toEqual([
      `${NODE_ID}.worked_example`, `${NODE_ID}.guided_practice`, `${NODE_ID}.independent_practice`,
    ]);
    expect(activities.map((activity) => activity.rendererKey)).toEqual([
      'least-polynomial-degree', 'least-polynomial-degree', 'least-polynomial-degree',
    ]);

    clearActivityRegistry();
    ensureActivitiesRegistered();
    expect(getActivityComponent('least-polynomial-degree')).toBeTruthy();
    for (const activity of activities) expect(getStudentPreviewProblem(activity)).toBeNull();

    const worked = activities[0]!;
    const workedIntercept = vi.fn();
    const workedView = renderPreview(worked, workedIntercept);
    const workedOutput = generateTopic15LeastPolynomialDegreeOutput(0);
    expect(await screen.findByRole('heading', { name: 'Worked Example: Least Polynomial Degree' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(screen.getByText('The zero x = i√3 is given for a real-coefficient polynomial f. Its graph shows at least 3 real zeros. What is the least possible degree of f?')).toBeInTheDocument();
    expect(screen.getByText('Given nonreal zero: x = i√3')).toBeInTheDocument();
    expect(screen.getByText('Real zeros shown by the graph: At least 3')).toBeInTheDocument();
    expect(screen.getByText('Least possible degree: 5')).toBeInTheDocument();
    expect(screen.getByText('Because f has real coefficients, x = -i√3 is also a zero.')).toBeInTheDocument();
    expect(screen.getByText('The conjugate pair contributes 2 nonreal zeros, and the graph shows at least 3 real zeros.')).toBeInTheDocument();
    expect(screen.getByText('Therefore, the least possible degree is 2 + 3 = 5.')).toBeInTheDocument();
    const answerLabel = screen.getByText('Answer:', { selector: 'strong' });
    expect(answerLabel.parentElement).toHaveTextContent('Answer: The least possible degree is 5.');
    expect(screen.queryAllByRole('spinbutton')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();
    expect(workedOutput.data.rendererProps).toEqual({
      prompt: 'The zero x = i√3 is given for a real-coefficient polynomial f. Its graph shows at least 3 real zeros. What is the least possible degree of f?',
      givenNonrealZero: 'i√3',
      realZeroCount: 3,
      presentationMode: 'independent_practice',
    });
    expect(workedIntercept).not.toHaveBeenCalled();
    workedView.unmount();

    const guided = activities[1]!;
    const guidedIntercept = vi.fn();
    const guidedView = renderPreview(guided, guidedIntercept);
    expect(await screen.findByRole('heading', { name: 'Guided Practice: Least Polynomial Degree' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(screen.getByText('The zero x = 1 + i is given for a real-coefficient polynomial f. Its graph shows at least 3 real zeros. What is the least possible degree of f?')).toBeInTheDocument();
    expect(screen.getByText('Given nonreal zero: x = 1 + i')).toBeInTheDocument();
    expect(screen.getByText('Real zeros shown by the graph: At least 3')).toBeInTheDocument();
    expect(screen.getByText('Identify the conjugate zero.')).toBeInTheDocument();
    expect(screen.getByText('Count the conjugate pair and the real zeros.')).toBeInTheDocument();
    expect(screen.getByText('Add 2 for the conjugate pair to the number of real zeros.')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Least possible degree' })).toBeInTheDocument();
    expect(screen.queryByText('Least possible degree: 5')).toBeNull();
    expect(screen.queryByText('Answer: The least possible degree is 5.')).toBeNull();
    expectNoAuthority(guided.props);
    const guidedSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(guidedSubmit).toBeDisabled();
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Least possible degree' }), { target: { value: '7' } });
    expect(guidedSubmit).toBeEnabled();
    fireEvent.click(guidedSubmit);
    expect(guidedIntercept).toHaveBeenCalledOnce();
    const guidedPayload = guidedIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expectPracticeEnvelope(guidedPayload, guided.stableActivityId, 'guided_practice', 7);
    expectNoAuthority(guidedPayload);
    guidedView.unmount();

    const independent = activities[2]!;
    const independentIntercept = vi.fn();
    const independentView = renderPreview(independent, independentIntercept);
    expect(await screen.findByRole('heading', { name: 'Independent Practice: Least Polynomial Degree' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(screen.getByText('The zero x = 2 + 2i is given for a real-coefficient polynomial f. Its graph shows at least 2 real zeros. What is the least possible degree of f?')).toBeInTheDocument();
    expect(screen.getByText('Given nonreal zero: x = 2 + 2i')).toBeInTheDocument();
    expect(screen.getByText('Real zeros shown by the graph: At least 2')).toBeInTheDocument();
    expect(screen.queryByText('Identify the conjugate zero.')).toBeNull();
    expect(screen.queryByText('Count the conjugate pair and the real zeros.')).toBeNull();
    expect(screen.queryByText('Add 2 for the conjugate pair to the number of real zeros.')).toBeNull();
    expect(screen.queryByText('Least possible degree: 5')).toBeNull();
    expectNoAuthority(independent.props);
    const independentSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(independentSubmit).toBeDisabled();
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Least possible degree' }), { target: { value: '4' } });
    expect(independentSubmit).toBeEnabled();
    fireEvent.click(independentSubmit);
    expect(independentIntercept).toHaveBeenCalledOnce();
    const independentPayload = independentIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expectPracticeEnvelope(independentPayload, independent.stableActivityId, 'independent_practice', 4);
    expectNoAuthority(independentPayload);
    independentView.unmount();
  });
});
