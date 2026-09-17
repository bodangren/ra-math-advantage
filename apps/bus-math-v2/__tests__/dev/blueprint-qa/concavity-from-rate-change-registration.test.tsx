import fs from 'node:fs';
import path from 'node:path';

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { clearActivityRegistry, getActivityComponent } from '@math-platform/activity-components/registry';
import type { ProjectedActivity } from '@math-platform/knowledge-space-practice';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import { RendererPreview, getStudentPreviewProblem } from '@/app/(dev)/blueprint-qa/components/RendererPreview';
import { ensureActivitiesRegistered } from '@/app/(dev)/blueprint-qa/components/register-activities';
import {
  generateTopic13ConcavityFromRateChange,
} from '@math-platform/math-content/knowledge-space';

const NODE_ID = 'math.precalc.skill.1.3.determine-concavity-from-rate-of-change';
const SOURCE_PROMPT = 'Determine concavity.';
const SOURCE_X_VALUES = [1, 1.1, 1.2, 1.3] as const;
const SOURCE_Y_VALUES = [4, 1, -1, -2] as const;
const SOURCE_STEPS = [
  'The first differences are -3, -2, and -1.',
  'The first differences increase from -3 to -2 to -1.',
  'Therefore, k is concave up.',
] as const;
const SOURCE_FINAL_ANSWER = 'concave up.';
const GUIDED_STEPS = [
  'Check whether the input widths are equal.',
  'Find the first differences.',
  'Decide whether the first differences increase, decrease, or reverse direction.',
  "Classify the function's concavity.",
] as const;
const GUIDED_FIELD_HELP =
  'Increasing first differences indicate concave up. Decreasing first differences indicate concave down.';
const BANNED_AUTHORITY_KEYS = new Set([
  'correctClassification',
  'correctAnswer',
  'answerKey',
  'hidden',
  'authority',
  'isCorrect',
  'score',
  'maxScore',
  'gradingMetadata',
  'solutionSteps',
  'finalAnswer',
  'relationship',
  'correctness',
  'differences',
  'secondDifferences',
  'solution',
  'steps',
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
  if (activity.mode === 'assessment') {
    throw new Error('Assessment activities are not valid student preview state.');
  }

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
    title: 'Determine concavity from rate-of-change behavior',
    domain: 'math.precalc',
    reviewStatus: 'draft',
    metadata: { course: 'precalc', unit: '1', lesson: '3' },
  };
}

function collectObjectKeys(value: unknown, keys: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectObjectKeys(item, keys));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, nestedValue]) => {
      keys.push(key);
      collectObjectKeys(nestedValue, keys);
    });
  }
  return keys;
}

function expectNoAuthority(value: unknown): void {
  expect(collectObjectKeys(value).filter((key) => BANNED_AUTHORITY_KEYS.has(key))).toEqual([]);
}

function assertSourceTable(): void {
  const table = screen.getByRole('table', { name: 'k(x) values' });
  const rows = within(table).getAllByRole('row');
  expect(rows).toHaveLength(2);
  expect(rows[0]?.textContent).toBe('x11.11.21.3');
  expect(rows[1]?.textContent).toBe('k(x)41-1-2');
}

function renderPreview(activity: ProjectedActivity, onIntercept: (entry: { rawAnswer: unknown }) => void) {
  return render(
    <RendererPreview
      state={makeState(activity)}
      selectedNode={makeNode()}
      activity={activity}
      onIntercept={(entry) => onIntercept(entry)}
    />,
  );
}

describe('Business Math QA concavity-from-rate-change registration', () => {
  it('registers and previews the exact Topic 1.3 Example 2 modes', async () => {
    const activities = loadActivities();
    expect(activities).toHaveLength(3);
    expect(activities.map((activity) => activity.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);
    expect(activities.map((activity) => activity.stableActivityId)).toEqual([
      `${NODE_ID}.worked_example`,
      `${NODE_ID}.guided_practice`,
      `${NODE_ID}.independent_practice`,
    ]);

    clearActivityRegistry();
    ensureActivitiesRegistered();
    expect(getActivityComponent('concavity-from-rate-change')).toBeTruthy();
    for (const activity of activities) expect(getStudentPreviewProblem(activity)).toBeNull();

    const worked = activities[0]!;
    const workedIntercept = vi.fn();
    const workedView = renderPreview(worked, workedIntercept);
    expect(await screen.findByRole('heading', { name: 'Worked Example: Determine Concavity' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(worked.props).toMatchObject({
      prompt: SOURCE_PROMPT,
      functionName: 'k',
      xValues: SOURCE_X_VALUES,
      yValues: SOURCE_Y_VALUES,
      correctClassification: 'concave_up',
      steps: [...SOURCE_STEPS],
      finalAnswer: SOURCE_FINAL_ANSWER,
    });
    expect(generateTopic13ConcavityFromRateChange(0).xValues).toEqual(SOURCE_X_VALUES);
    expect(generateTopic13ConcavityFromRateChange(0).yValues).toEqual(SOURCE_Y_VALUES);
    expect(screen.getByText(SOURCE_PROMPT)).toBeInTheDocument();
    assertSourceTable();
    const workedRadios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(workedRadios).toHaveLength(3);
    expect(workedRadios.filter((radio) => radio.checked)).toHaveLength(1);
    expect(screen.getByRole('radio', { name: 'Concave up' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Concave down' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Neither' })).not.toBeChecked();
    expect(workedRadios.every((radio) => radio.disabled)).toBe(true);
    for (const step of SOURCE_STEPS) expect(screen.getByText(step)).toBeInTheDocument();
    expect(screen.getByText(SOURCE_FINAL_ANSWER)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();
    expect(workedIntercept).not.toHaveBeenCalled();
    workedView.unmount();

    const guided = activities[1]!;
    const guidedIntercept = vi.fn();
    const guidedView = renderPreview(guided, guidedIntercept);
    const guidedVariant = generateTopic13ConcavityFromRateChange(1);
    expect(await screen.findByRole('heading', { name: 'Guided Practice: Determine Concavity' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(guided.props).toMatchObject({
      prompt: guidedVariant.prompt,
      functionName: guidedVariant.functionName,
      xValues: guidedVariant.xValues,
      yValues: guidedVariant.yValues,
      presentationMode: 'guided_practice',
      guidedSteps: [...GUIDED_STEPS],
      fieldHelp: GUIDED_FIELD_HELP,
    });
    expect(screen.getByRole('table', { name: 'k(x) values' })).toBeInTheDocument();
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeInTheDocument();
    expect(screen.getByText(GUIDED_FIELD_HELP)).toBeInTheDocument();
    expectNoAuthority(guided.props);
    const guidedRadios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(guidedRadios).toHaveLength(3);
    expect(guidedRadios.every((radio) => !radio.disabled && !radio.checked)).toBe(true);
    const guidedSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(guidedSubmit).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'Concave down' }));
    expect(guidedSubmit).toBeEnabled();
    fireEvent.click(guidedSubmit);
    expect(guidedIntercept).toHaveBeenCalledTimes(1);
    const guidedPayload = guidedIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expect(guidedPayload.answers).toEqual({ classification: 'concave_down' });
    expect(guidedPayload.parts).toEqual([{ partId: 'classification', rawAnswer: 'concave_down' }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(guidedPayload)).not.toThrow();
    expectNoAuthority(guidedPayload);
    guidedView.unmount();

    const independent = activities[2]!;
    const independentIntercept = vi.fn();
    const independentView = renderPreview(independent, independentIntercept);
    const independentVariant = generateTopic13ConcavityFromRateChange(2);
    expect(await screen.findByRole('heading', { name: 'Independent Practice: Determine Concavity' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(independent.props).toMatchObject({
      prompt: independentVariant.prompt,
      functionName: independentVariant.functionName,
      xValues: independentVariant.xValues,
      yValues: independentVariant.yValues,
      presentationMode: 'independent_practice',
    });
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(GUIDED_FIELD_HELP)).toBeNull();
    for (const step of SOURCE_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(SOURCE_FINAL_ANSWER)).toBeNull();
    expectNoAuthority(independent.props);
    const independentRadios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(independentRadios).toHaveLength(3);
    expect(independentRadios.every((radio) => !radio.disabled && !radio.checked)).toBe(true);
    const independentSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(independentSubmit).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'Neither' }));
    expect(independentSubmit).toBeEnabled();
    fireEvent.click(independentSubmit);
    expect(independentIntercept).toHaveBeenCalledTimes(1);
    const independentPayload = independentIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expect(independentPayload.answers).toEqual({ classification: 'neither' });
    expect(independentPayload.parts).toEqual([{ partId: 'classification', rawAnswer: 'neither' }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(independentPayload)).not.toThrow();
    expectNoAuthority(independentPayload);
    independentView.unmount();
  });
});
