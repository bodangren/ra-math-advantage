import fs from 'node:fs';
import path from 'node:path';

import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearActivityRegistry, getActivityComponent } from '@math-platform/activity-components/registry';
import type { ProjectedActivity } from '@math-platform/knowledge-space-practice';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import { RendererPreview, getStudentPreviewProblem } from '@/app/(dev)/blueprint-qa/components/RendererPreview';
import { ensureActivitiesRegistered } from '@/app/(dev)/blueprint-qa/components/register-activities';
import { generateTopic14RateSignAndTrendOutput } from '@math-platform/math-content/knowledge-space';

const NODE_ID = 'math.precalc.skill.1.4.describe-rate-of-change-behavior-on-intervals';
const AP_PROJECTION_PATH = path.resolve(
  process.cwd(),
  '../pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json',
);
const GUIDED_STEPS = [
  'Determine whether h rises or falls on the interval.',
  'Determine whether the rate of change increases or decreases as x increases.',
] as const;
const GUIDED_FIELD_HELP = 'A positive rate means h rises. A decreasing rate means the graph flattens as x increases.';
const BANNED_AUTHORITY_KEYS = new Set([
  'answer', 'answerKey', 'authority', 'correctAnswer', 'correctAnswers', 'correctness',
  'expectedAnswer', 'finalAnswer', 'grading', 'gradingMetadata', 'isCorrect', 'maxScore',
  'score', 'solution', 'solutionSteps', 'steps',
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

function makePreviewProps(activity: ProjectedActivity) {
  return {
    state: makeState(activity),
    selectedNode: {
      id: NODE_ID,
      kind: 'skill',
      title: 'Describe rate-of-change behavior on intervals using precise language',
      domain: 'math.precalc',
      reviewStatus: 'draft',
      metadata: { course: 'precalc', unit: '1', lesson: '4' },
    },
    activity,
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

describe('Business Math QA rate-sign-and-trend registration', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    const calls = consoleError.mock.calls;
    consoleError.mockRestore();
    expect(calls).toEqual([]);
  });

  it('registers and previews all exact Topic 1.4 Example 3 modes', async () => {
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
    expect(getActivityComponent('rate-sign-and-trend-from-graph')).toBeTruthy();
    for (const activity of activities) expect(getStudentPreviewProblem(activity)).toBeNull();

    const worked = activities[0]!;
    const workedIntercept = vi.fn();
    const workedView = render(
      <RendererPreview {...makePreviewProps(worked)} onIntercept={workedIntercept} />,
    );
    const workedOutput = generateTopic14RateSignAndTrendOutput(0);
    const workedPublic = workedOutput.data.rendererProps as Record<string, unknown>;
    expect(await screen.findByRole('heading', { name: 'Worked Example: Rate Sign and Trend' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(worked.props).toEqual({
      ...workedPublic,
      presentationMode: 'worked_example',
      correctAnswers: workedOutput.expectedAnswer,
      steps: workedOutput.solutionSteps.map((step) => step.description),
      finalAnswer: 'The rate of change is positive and decreasing on (3, 4).',
    });
    expect(screen.getByRole('img', { name: /Graph of h/ })).toBeInTheDocument();
    const workedTable = screen.getByRole('table', { name: 'Graph data for h' });
    expect(within(workedTable).getAllByRole('row')).toHaveLength(6);
    expect(screen.getByText('positive')).toBeInTheDocument();
    expect(screen.getByText('decreasing')).toBeInTheDocument();
    for (const step of workedOutput.solutionSteps) expect(screen.getByText(step.description)).toBeInTheDocument();
    expect(screen.getByText('The rate of change is positive and decreasing on (3, 4).')).toBeInTheDocument();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();
    expect(workedIntercept).not.toHaveBeenCalled();
    workedView.unmount();

    const guided = activities[1]!;
    const guidedIntercept = vi.fn();
    const guidedView = render(
      <RendererPreview {...makePreviewProps(guided)} onIntercept={guidedIntercept} />,
    );
    const guidedOutput = generateTopic14RateSignAndTrendOutput(1);
    const guidedPublic = guidedOutput.data.rendererProps as Record<string, unknown>;
    expect(await screen.findByRole('heading', { name: 'Guided Practice: Rate Sign and Trend' })).toBeInTheDocument();
    expect(guided.props).toEqual({
      ...guidedPublic,
      presentationMode: 'guided_practice',
      guidedSteps: [...GUIDED_STEPS],
      fieldHelp: GUIDED_FIELD_HELP,
    });
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeInTheDocument();
    expect(screen.getByText(GUIDED_FIELD_HELP)).toBeInTheDocument();
    expectNoAuthority(guided.props);
    const guidedSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(guidedSubmit).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'Positive rate' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Decreasing rate trend' }));
    expect(guidedSubmit).toBeEnabled();
    fireEvent.click(guidedSubmit);
    expect(guidedIntercept).toHaveBeenCalledTimes(1);
    const guidedPayload = guidedIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expect(guidedPayload.answers).toEqual({ rateSign: 'positive', rateTrend: 'decreasing' });
    expect(guidedPayload.parts).toEqual([
      { partId: 'rateSign', rawAnswer: 'positive' },
      { partId: 'rateTrend', rawAnswer: 'decreasing' },
    ]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(guidedPayload)).not.toThrow();
    expectNoAuthority(guidedPayload);
    guidedView.unmount();

    const independent = activities[2]!;
    const independentIntercept = vi.fn();
    const independentView = render(
      <RendererPreview {...makePreviewProps(independent)} onIntercept={independentIntercept} />,
    );
    const independentOutput = generateTopic14RateSignAndTrendOutput(2);
    const independentPublic = independentOutput.data.rendererProps as Record<string, unknown>;
    expect(await screen.findByRole('heading', { name: 'Independent Practice: Rate Sign and Trend' })).toBeInTheDocument();
    expect(independent.props).toEqual({
      ...independentPublic,
      presentationMode: 'independent_practice',
    });
    expect(screen.queryByText(GUIDED_FIELD_HELP)).toBeNull();
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expectNoAuthority(independent.props);
    fireEvent.click(screen.getByRole('radio', { name: 'Negative rate' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Increasing rate trend' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
    expect(independentIntercept).toHaveBeenCalledTimes(1);
    const independentPayload = independentIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expect(independentPayload.parts).toEqual([
      { partId: 'rateSign', rawAnswer: 'negative' },
      { partId: 'rateTrend', rawAnswer: 'increasing' },
    ]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(independentPayload)).not.toThrow();
    expectNoAuthority(independentPayload);
    independentView.unmount();
  });
});
