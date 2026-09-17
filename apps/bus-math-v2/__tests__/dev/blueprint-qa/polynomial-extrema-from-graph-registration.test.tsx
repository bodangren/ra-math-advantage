import fs from 'node:fs';
import path from 'node:path';

import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearActivityRegistry, getActivityComponent } from '@math-platform/activity-components/registry';
import type { ProjectedActivity } from '@math-platform/knowledge-space-practice';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import { RendererPreview, getStudentPreviewProblem } from '@/app/(dev)/blueprint-qa/components/RendererPreview';
import { ensureActivitiesRegistered } from '@/app/(dev)/blueprint-qa/components/register-activities';
import {
  generateTopic14PolynomialExtremaFromGraphOutput,
} from '@math-platform/math-content/knowledge-space';

const NODE_ID = 'math.precalc.skill.1.4.identify-relative-and-absolute-extrema-from-graphs';
const SOURCE_FINAL_ANSWER = 'x = 1 is a relative minimum and the absolute minimum; x = 4 is a relative maximum.';
const GUIDED_STEPS = [
  'Find where the graph changes from decreasing to increasing.',
  'Find where the graph changes from increasing to decreasing.',
  'Compare the displayed y-values to identify the absolute minimum.',
] as const;
const GUIDED_FIELD_HELP = 'A relative extremum occurs where the graph changes direction. The absolute minimum is the lowest displayed value.';
const PART_IDS = ['relative_minimum_x', 'relative_maximum_x', 'absolute_minimum_x'] as const;
const BANNED_AUTHORITY_KEYS = new Set([
  'answer', 'answerKey', 'authority', 'correctAnswer', 'correctAnswers', 'correctness',
  'expectedAnswer', 'finalAnswer', 'grading', 'gradingMetadata', 'hidden', 'isCorrect',
  'maxScore', 'score', 'solution', 'solutionSteps', 'steps',
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

function makeNode() {
  return {
    id: NODE_ID,
    kind: 'skill',
    title: 'Identify relative and absolute extrema from graphs',
    domain: 'math.precalc',
    reviewStatus: 'draft',
    metadata: { course: 'precalc', unit: '1', lesson: '4' },
  };
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
  expect(() => practiceSubmissionEnvelopeSchema.parse(payload)).not.toThrow();
}

function renderPreview(activity: ProjectedActivity, onIntercept: (entry: { rawAnswer: unknown }) => void) {
  return render(
    <RendererPreview
      state={makeState(activity)}
      selectedNode={makeNode()}
      activity={activity}
      onIntercept={onIntercept}
    />,
  );
}

describe('Business Math QA polynomial-extrema-from-graph registration', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    const calls = consoleError.mock.calls;
    consoleError.mockRestore();
    expect(calls).toEqual([]);
  });

  it('registers and previews all exact Topic 1.4 Example 2 modes', async () => {
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
    expect(getActivityComponent('polynomial-extrema-from-graph')).toBeTruthy();
    for (const activity of activities) expect(getStudentPreviewProblem(activity)).toBeNull();

    const worked = activities[0]!;
    const workedIntercept = vi.fn();
    const workedView = renderPreview(worked, workedIntercept);
    const workedOutput = generateTopic14PolynomialExtremaFromGraphOutput(0);
    const workedPublic = workedOutput.data.rendererProps as Record<string, unknown> & {
      points: readonly { x: number; y: number }[];
    };
    expect(await screen.findByRole('heading', { name: 'Worked Example: Identify Extrema from a Graph' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(screen.getByRole('img', { name: /Graph of polynomial g/ })).toBeInTheDocument();
    const workedTable = screen.getByRole('table', { name: 'Graph data for polynomial g' });
    expect(within(workedTable).getAllByRole('row')).toHaveLength(workedPublic.points.length + 1);
    expect(within(workedTable).getAllByRole('row').slice(1).map((row) => row.textContent)).toEqual(
      workedPublic.points.map((point) => `${point.x}${point.y}`),
    );
    expect(screen.getByTestId('polynomial-extrema-curve').getAttribute('points')?.split(' ')).toHaveLength(25);
    expect(worked.props).toEqual({
      ...workedPublic,
      presentationMode: 'worked_example',
      correctAnswers: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps.map((step) => step.description),
      finalAnswer: SOURCE_FINAL_ANSWER,
    });
    expect(screen.getByText('Relative minimum x-value').parentElement?.textContent).toBe('Relative minimum x-value1');
    expect(screen.getByText('Relative maximum x-value').parentElement?.textContent).toBe('Relative maximum x-value4');
    expect(screen.getByText('Absolute minimum x-value').parentElement?.textContent).toBe('Absolute minimum x-value1');
    for (const step of workedOutput.solutionSteps) expect(screen.getByText(step.description)).toBeInTheDocument();
    expect(screen.getByText(SOURCE_FINAL_ANSWER)).toBeInTheDocument();
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();
    expect(workedIntercept).not.toHaveBeenCalled();
    workedView.unmount();

    const guided = activities[1]!;
    const guidedIntercept = vi.fn();
    const guidedView = renderPreview(guided, guidedIntercept);
    const guidedOutput = generateTopic14PolynomialExtremaFromGraphOutput(1).data.rendererProps as Record<string, unknown>;
    expect(await screen.findByRole('heading', { name: 'Guided Practice: Identify Extrema from a Graph' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(guided.props).toEqual({
      ...guidedOutput,
      presentationMode: 'guided_practice',
      guidedSteps: [...GUIDED_STEPS],
      fieldHelp: GUIDED_FIELD_HELP,
    });
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeInTheDocument();
    expect(screen.getByText(GUIDED_FIELD_HELP)).toBeInTheDocument();
    expectNoAuthority(guided.props);
    const guidedSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(guidedSubmit).toBeDisabled();
    const guidedAnswers = {
      relative_minimum_x: ' 3 ',
      relative_maximum_x: 'not-a-number',
      absolute_minimum_x: ' 3.0 ',
    };
    fireEvent.change(screen.getByRole('textbox', { name: 'Relative minimum x-value' }), { target: { value: guidedAnswers.relative_minimum_x } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Relative maximum x-value' }), { target: { value: guidedAnswers.relative_maximum_x } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Absolute minimum x-value' }), { target: { value: guidedAnswers.absolute_minimum_x } });
    expect(guidedSubmit).toBeEnabled();
    fireEvent.click(guidedSubmit);
    expect(guidedIntercept).toHaveBeenCalledTimes(1);
    const guidedPayload = guidedIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expectPracticeEnvelope(guidedPayload, guided.stableActivityId, 'guided_practice', guidedAnswers);
    expectNoAuthority(guidedPayload);
    guidedView.unmount();

    const independent = activities[2]!;
    const independentIntercept = vi.fn();
    const independentView = renderPreview(independent, independentIntercept);
    const independentOutput = generateTopic14PolynomialExtremaFromGraphOutput(2).data.rendererProps as Record<string, unknown>;
    expect(await screen.findByRole('heading', { name: 'Independent Practice: Identify Extrema from a Graph' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(independent.props).toEqual({ ...independentOutput, presentationMode: 'independent_practice' });
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(GUIDED_FIELD_HELP)).toBeNull();
    expect(screen.queryByText(SOURCE_FINAL_ANSWER)).toBeNull();
    expectNoAuthority(independent.props);
    const independentSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(independentSubmit).toBeDisabled();
    const independentAnswers = {
      relative_minimum_x: ' 6 ',
      relative_maximum_x: '11.0',
      absolute_minimum_x: '6',
    };
    fireEvent.change(screen.getByRole('textbox', { name: 'Relative minimum x-value' }), { target: { value: independentAnswers.relative_minimum_x } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Relative maximum x-value' }), { target: { value: independentAnswers.relative_maximum_x } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Absolute minimum x-value' }), { target: { value: independentAnswers.absolute_minimum_x } });
    fireEvent.click(independentSubmit);
    expect(independentIntercept).toHaveBeenCalledTimes(1);
    const independentPayload = independentIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expectPracticeEnvelope(independentPayload, independent.stableActivityId, 'independent_practice', independentAnswers);
    expectNoAuthority(independentPayload);
    independentView.unmount();
  });
});
