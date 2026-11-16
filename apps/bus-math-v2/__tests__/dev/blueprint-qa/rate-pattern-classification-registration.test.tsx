import fs from 'node:fs';
import path from 'node:path';

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { clearActivityRegistry, getActivityComponent } from '@math-platform/activity-components/registry';
import type { ProjectedActivity } from '@math-platform/knowledge-space-practice';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import { RendererPreview, getStudentPreviewProblem } from '@/app/(dev)/blueprint-qa/components/RendererPreview';
import { ensureActivitiesRegistered } from '@/app/(dev)/blueprint-qa/components/register-activities';
import { generateTopic13RatePatternClassification } from '@math-platform/math-content/knowledge-space';

const NODE_ID = 'math.precalc.skill.1.3.classify-linear-vs-quadratic-from-rate-patterns';
const SOURCE_PROMPT = 'Could each function be linear, quadratic, or neither?';
const SOURCE_CASES = [
  { id: 'a', functionName: 'f', xValues: [1, 2, 3, 4], yValues: [0, 1, 4, 9] },
  { id: 'b', functionName: 'g', xValues: [1, 2, 5, 10], yValues: [0, 1, 4, 9] },
  { id: 'c', functionName: 'p', xValues: [1, 1.1, 1.2, 1.3], yValues: [1, 7, 11, 13] },
] as const;
const WORKED_STEPS = [
  'Equal input widths of 1 and constant second differences of 2 show that f could be quadratic (concave up).',
  'The input widths are 1, 3, and 5. The output changes are also 1, 3, and 5. Each average rate is 1, so g could be linear: g(x) = x - 1.',
  'Equal input widths of 0.1 and differences 6, 4, 2 with constant second differences of -2 show that p could be quadratic (concave down).',
 ];
const FINAL_ANSWER = 'a) quadratic; b) linear; c) quadratic.';
const GUIDED_STEPS = ['Find each input width.', 'Divide each output change by its input width.', 'Compare the average rates and their second divided differences.', 'Classify each function.'];
const GUIDED_FIELD_HELP = 'Compute average rates using the actual input widths. Equal first divided differences fit a line. Equal nonzero second divided differences fit a quadratic.';
const BANNED_AUTHORITY_KEYS = new Set([
  'answer', 'answerKey', 'authority', 'correctAnswer', 'correctAnswers', 'correctness',
  'expectedAnswer', 'finalAnswer', 'grading', 'gradingMetadata', 'isCorrect', 'maxScore',
  'normalizedAnswer', 'score', 'solutionSteps', 'steps',
]);
function loadActivities(): ProjectedActivity[] {
  const document = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../../../pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json'), 'utf8')) as {
    activities: ProjectedActivity[];
  };
  return document.activities.filter((activity) => activity.nodeId === NODE_ID);
}

function makeState(mode: Exclude<ProjectedActivity['mode'], 'assessment'>, seed: number) {
  return {
    selectedNodeId: NODE_ID,
    seed,
    difficulty: 0.5,
    mode,
    generatorOutput: null,
    generatorError: null,
    lastSubmission: null,
  };
}

function makeNode() {
  return {
    id: NODE_ID,
    kind: 'skill',
    title: 'Classify linear vs quadratic from rate patterns',
    domain: 'mathematics',
    reviewStatus: 'draft',
    metadata: { course: 'precalc', unit: '1', lesson: '3' },
  };
}

function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

function assertTables(cases: readonly { id: string; functionName: string; xValues: readonly number[]; yValues: readonly number[] }[]): void {
  expect(screen.getAllByRole('table')).toHaveLength(3);
  for (const tableCase of cases) {
    const table = screen.getByRole('table', { name: `Case ${tableCase.id}: ${tableCase.functionName}` });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(2);
    expect(rows[0]?.textContent).toBe(`x${tableCase.xValues.map(formatValue).join('')}`);
    expect(rows[1]?.textContent).toBe(`${tableCase.functionName}(x)${tableCase.yValues.map(formatValue).join('')}`);
  }
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

function makePreviewProps(activity: ProjectedActivity) {
  return {
    state: makeState(activity.mode as Exclude<ProjectedActivity['mode'], 'assessment'>, activity.mode === 'worked_example' ? 0 : activity.mode === 'guided_practice' ? 1 : 2),
    selectedNode: makeNode(),
    activity,
  };
}

describe('Business Math QA rate-pattern-classification registration', () => {
  it('registers and previews the exact Topic 1.3 Example 1 modes', async () => {
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
    expect(getActivityComponent('rate-pattern-classification')).toBeTruthy();
    for (const activity of activities) expect(getStudentPreviewProblem(activity)).toBeNull();

    const worked = activities[0]!;
    const workedIntercept = vi.fn();
    const workedView = render(<RendererPreview {...makePreviewProps(worked)} onIntercept={workedIntercept} />);
    expect(await screen.findByRole('heading', { name: 'Worked Example: Classify Rate Patterns' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(worked.props.prompt).toBe(SOURCE_PROMPT);
    expect(worked.props.cases).toEqual(SOURCE_CASES);
    expect(generateTopic13RatePatternClassification(0).cases).toEqual(SOURCE_CASES);
    expect(screen.getByText(SOURCE_PROMPT)).toBeInTheDocument();
    assertTables(SOURCE_CASES);
    const workedRadios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(workedRadios).toHaveLength(12);
    expect(workedRadios.filter((radio) => radio.checked)).toHaveLength(3);
    expect(within(screen.getByRole('group', { name: 'Classify case a' })).getByRole('radio', { name: 'Quadratic' })).toBeChecked();
    expect(within(screen.getByRole('group', { name: 'Classify case b' })).getByRole('radio', { name: 'Linear' })).toBeChecked();
    expect(within(screen.getByRole('group', { name: 'Classify case c' })).getByRole('radio', { name: 'Quadratic' })).toBeChecked();
    expect(workedRadios.every((radio) => radio.disabled)).toBe(true);
    expect(worked.props.steps).toEqual(WORKED_STEPS);
    for (const step of WORKED_STEPS) expect(screen.getByText(step)).toBeInTheDocument();
    expect(worked.props.finalAnswer).toBe(FINAL_ANSWER);
    expect(screen.getByText(FINAL_ANSWER)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();
    expect(workedIntercept).not.toHaveBeenCalled();
    workedView.unmount();

    const guided = activities[1]!;
    const guidedIntercept = vi.fn();
    const guidedView = render(<RendererPreview {...makePreviewProps(guided)} onIntercept={guidedIntercept} />);
    expect(await screen.findByRole('heading', { name: 'Guided Practice: Classify Rate Patterns' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(guided.props.cases).toEqual(generateTopic13RatePatternClassification(1).cases);
    assertTables(generateTopic13RatePatternClassification(1).cases);
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeInTheDocument();
    expect(screen.getByText(GUIDED_FIELD_HELP)).toBeInTheDocument();
    expectNoAuthority(guided.props);
    const guidedRadios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(guidedRadios).toHaveLength(12);
    expect(guidedRadios.every((radio) => !radio.disabled)).toBe(true);
    const guidedSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(guidedSubmit).toBeDisabled();
    const guidedChoices = { a: 'Linear', b: 'Quadratic', c: 'Neither' } as const;
    for (const id of ['a', 'b', 'c'] as const) {
      fireEvent.click(within(screen.getByRole('group', { name: `Classify case ${id}` })).getByRole('radio', { name: guidedChoices[id] }));
    }
    expect(guidedSubmit).toBeEnabled();
    fireEvent.click(guidedSubmit);
    expect(guidedIntercept).toHaveBeenCalledTimes(1);
    const guidedPayload = guidedIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expect(guidedPayload.answers).toEqual({ a: 'linear', b: 'quadratic', c: 'neither' });
    expect(guidedPayload.parts).toEqual([
      { partId: 'a', rawAnswer: 'linear' },
      { partId: 'b', rawAnswer: 'quadratic' },
      { partId: 'c', rawAnswer: 'neither' },
    ]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(guidedPayload)).not.toThrow();
    expectNoAuthority(guidedPayload);
    guidedView.unmount();

    const independent = activities[2]!;
    const independentIntercept = vi.fn();
    const independentView = render(<RendererPreview {...makePreviewProps(independent)} onIntercept={independentIntercept} />);
    expect(await screen.findByRole('heading', { name: 'Independent Practice: Classify Rate Patterns' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(independent.props.cases).toEqual(generateTopic13RatePatternClassification(2).cases);
    assertTables(generateTopic13RatePatternClassification(2).cases);
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(GUIDED_FIELD_HELP)).toBeNull();
    for (const step of WORKED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(FINAL_ANSWER)).toBeNull();
    expectNoAuthority(independent.props);
    const independentRadios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(independentRadios).toHaveLength(12);
    expect(independentRadios.every((radio) => !radio.disabled)).toBe(true);
    const independentSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(independentSubmit).toBeDisabled();
    const independentChoices = { a: 'Cannot determine', b: 'Linear', c: 'Quadratic' } as const;
    for (const id of ['a', 'b', 'c'] as const) {
      fireEvent.click(within(screen.getByRole('group', { name: `Classify case ${id}` })).getByRole('radio', { name: independentChoices[id] }));
    }
    expect(independentSubmit).toBeEnabled();
    fireEvent.click(independentSubmit);
    expect(independentIntercept).toHaveBeenCalledTimes(1);
    const independentPayload = independentIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expect(independentPayload.answers).toEqual({ a: 'cannot_determine', b: 'linear', c: 'quadratic' });
    expect(independentPayload.parts).toEqual([
      { partId: 'a', rawAnswer: 'cannot_determine' },
      { partId: 'b', rawAnswer: 'linear' },
      { partId: 'c', rawAnswer: 'quadratic' },
    ]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(independentPayload)).not.toThrow();
    expectNoAuthority(independentPayload);
    independentView.unmount();
  });
});
