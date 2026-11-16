import fs from 'node:fs';
import path from 'node:path';

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearActivityRegistry, getActivityComponent } from '@math-platform/activity-components/registry';
import type { ProjectedActivity } from '@math-platform/knowledge-space-practice';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import { RendererPreview, getStudentPreviewProblem } from '@/app/(dev)/blueprint-qa/components/RendererPreview';
import { ensureActivitiesRegistered } from '@/app/(dev)/blueprint-qa/components/register-activities';
import {
  generateTopic14PolynomialDegreeLeadingCoefficient,
  generateTopic14PolynomialDegreeLeadingCoefficientOutput,
} from '@math-platform/math-content/knowledge-space';

const NODE_ID = 'math.precalc.skill.1.4.identify-polynomial-degree-and-leading-coefficient';
const SOURCE_PROMPT = 'Find the leading coefficient and degree.';
const SOURCE_ITEMS = [
  {
    id: 'a',
    functionName: 'f',
    terms: [
      { coefficient: 3, exponent: 4 },
      { coefficient: 2, exponent: 1 },
      { coefficient: -7, exponent: 0 },
    ],
  },
  {
    id: 'b',
    functionName: 'y',
    terms: [
      { coefficient: 0.5, exponent: 1 },
      { coefficient: -7, exponent: 3 },
      { coefficient: 11, exponent: 0 },
    ],
  },
  {
    id: 'c',
    functionName: 'g',
    terms: [{ coefficient: 4, exponent: 0 }],
  },
] as const;
const SOURCE_ANSWERS = {
  a_degree: 4,
  a_leading_coefficient: 3,
  b_degree: 3,
  b_leading_coefficient: -7,
  c_degree: 0,
  c_leading_coefficient: 4,
} as const;
const SOURCE_FINAL_ANSWER = 'a) degree 4, leading coefficient 3; b) degree 3, leading coefficient -7; c) degree 0, leading coefficient 4.';
const GUIDED_STEPS = [
  'Find the term with the greatest exponent in each expression.',
  'Use that exponent as the degree.',
  'Use the coefficient of that term as the leading coefficient.',
  'Treat a nonzero constant as a degree-0 polynomial.',
] as const;
const GUIDED_FIELD_HELP = 'Inspect exponents before you use the written term order.';
const AP_PROJECTION_PATH = path.resolve(
  process.cwd(),
  '../pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json',
);
const PART_IDS = [
  'a_degree',
  'a_leading_coefficient',
  'b_degree',
  'b_leading_coefficient',
  'c_degree',
  'c_leading_coefficient',
] as const;
const BANNED_AUTHORITY_KEYS = new Set([
  'answer',
  'answerKey',
  'authority',
  'correctAnswer',
  'correctAnswers',
  'correctness',
  'degree',
  'expectedAnswer',
  'finalAnswer',
  'grading',
  'gradingMetadata',
  'hidden',
  'isCorrect',
  'leadingCoefficient',
  'maxScore',
  'score',
  'solution',
  'solutionSteps',
  'steps',
]);

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
    title: 'Identify polynomial degree and leading coefficient',
    domain: 'math.precalc',
    reviewStatus: 'draft',
    metadata: { course: 'precalc', unit: '1', lesson: '4' },
  };
}

function makePreviewProps(activity: ProjectedActivity) {
  return {
    state: makeState(activity),
    selectedNode: makeNode(),
    activity,
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

function expectExactPracticeEnvelope(
  payload: Record<string, unknown>,
  activityId: string,
  mode: 'guided_practice' | 'independent_practice',
  answers: Record<string, string>,
): void {
  expect(Object.keys(payload).sort()).toEqual([
    'activityId',
    'analytics',
    'answers',
    'artifact',
    'attemptNumber',
    'contractVersion',
    'interactionHistory',
    'mode',
    'parts',
    'status',
    'studentFeedback',
    'submittedAt',
    'teacherSummary',
    'timing',
  ]);
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

function fillAnswers(answers: Record<string, string>): void {
  for (const [partId, rawAnswer] of Object.entries(answers)) {
    fireEvent.change(screen.getByRole('textbox', { name: partId.replace(/_/g, ' ') }), {
      target: { value: rawAnswer },
    });
  }
}

describe('Business Math QA polynomial-degree-leading-coefficient registration', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    const calls = consoleError.mock.calls;
    consoleError.mockRestore();
    expect(calls).toEqual([]);
  });

  it('registers and previews all exact Topic 1.4 Example 1 modes', async () => {
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
    expect(getActivityComponent('polynomial-degree-leading-coefficient')).toBeTruthy();
    for (const activity of activities) expect(getStudentPreviewProblem(activity)).toBeNull();

    const worked = activities[0]!;
    const workedIntercept = vi.fn();
    const workedView = render(
      <RendererPreview {...makePreviewProps(worked)} onIntercept={workedIntercept} />,
    );
    expect(await screen.findByRole('heading', { name: 'Worked Example: Degree and Leading Coefficient' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(worked.props).toEqual({
      prompt: SOURCE_PROMPT,
      items: SOURCE_ITEMS,
      presentationMode: 'worked_example',
      correctAnswers: SOURCE_ANSWERS,
      steps: generateTopic14PolynomialDegreeLeadingCoefficientOutput(0).solutionSteps.map((step) => step.description),
      finalAnswer: SOURCE_FINAL_ANSWER,
    });
    expect(generateTopic14PolynomialDegreeLeadingCoefficient(0).items).toEqual(SOURCE_ITEMS);
    expect(screen.getByText(SOURCE_PROMPT)).toBeInTheDocument();
    expect(screen.getByLabelText('a polynomial').textContent).toBe('f(x) = 3x4 + 2x - 7');
    expect(screen.getByLabelText('b polynomial').textContent).toBe('y = 0.5x - 7x3 + 11');
    expect(screen.getByLabelText('c polynomial').textContent).toBe('g(x) = 4');
    expect(screen.getByLabelText('b polynomial').querySelector('sup')?.textContent).toBe('3');
    for (const value of ['Degree: 4', 'Leading coefficient: 3', 'Degree: 3', 'Leading coefficient: -7', 'Degree: 0', 'Leading coefficient: 4']) {
      expect(screen.getByText(value)).toBeInTheDocument();
    }
    for (const step of worked.props.steps as string[]) expect(screen.getByText(step)).toBeInTheDocument();
    expect(screen.getByText(SOURCE_FINAL_ANSWER)).toBeInTheDocument();
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Submit answer' })).toBeNull();
    expect(workedIntercept).not.toHaveBeenCalled();
    workedView.unmount();

    const guided = activities[1]!;
    const guidedIntercept = vi.fn();
    const guidedView = render(
      <RendererPreview {...makePreviewProps(guided)} onIntercept={guidedIntercept} />,
    );
    const guidedVariant = generateTopic14PolynomialDegreeLeadingCoefficient(1);
    expect(await screen.findByRole('heading', { name: 'Guided Practice: Degree and Leading Coefficient' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(guided.props).toEqual({
      prompt: guidedVariant.prompt,
      items: guidedVariant.items,
      presentationMode: 'guided_practice',
      guidedSteps: GUIDED_STEPS,
      fieldHelp: GUIDED_FIELD_HELP,
    });
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
    for (const step of GUIDED_STEPS) expect(screen.getByText(step)).toBeInTheDocument();
    expect(screen.getByText(GUIDED_FIELD_HELP)).toBeInTheDocument();
    expectNoAuthority(guided.props);
    const guidedSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(guidedSubmit).toBeDisabled();
    const guidedAnswers = {
      a_degree: ' 5 ',
      a_leading_coefficient: '-2',
      b_degree: '2.0',
      b_leading_coefficient: ' 3.5 ',
      c_degree: '0',
      c_leading_coefficient: '-1',
    };
    fillAnswers(guidedAnswers);
    expect(guidedSubmit).toBeEnabled();
    fireEvent.click(guidedSubmit);
    expect(guidedIntercept).toHaveBeenCalledTimes(1);
    const guidedPayload = guidedIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expectExactPracticeEnvelope(guidedPayload, guided.stableActivityId, 'guided_practice', guidedAnswers);
    expectNoAuthority(guidedPayload);
    guidedView.unmount();

    const independent = activities[2]!;
    const independentIntercept = vi.fn();
    const independentView = render(
      <RendererPreview {...makePreviewProps(independent)} onIntercept={independentIntercept} />,
    );
    const independentVariant = generateTopic14PolynomialDegreeLeadingCoefficient(2);
    expect(await screen.findByRole('heading', { name: 'Independent Practice: Degree and Leading Coefficient' })).toBeInTheDocument();
    expect(screen.queryByText('Student view unavailable')).toBeNull();
    expect(independent.props).toEqual({
      prompt: independentVariant.prompt,
      items: independentVariant.items,
      presentationMode: 'independent_practice',
    });
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
    for (const step of GUIDED_STEPS) expect(screen.queryByText(step)).toBeNull();
    expect(screen.queryByText(GUIDED_FIELD_HELP)).toBeNull();
    expect(screen.queryByText(SOURCE_FINAL_ANSWER)).toBeNull();
    expectNoAuthority(independent.props);
    const independentSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(independentSubmit).toBeDisabled();
    const independentAnswers = {
      a_degree: '6',
      a_leading_coefficient: '1',
      b_degree: '3',
      b_leading_coefficient: '-4',
      c_degree: '0',
      c_leading_coefficient: '9',
    };
    fillAnswers(independentAnswers);
    expect(independentSubmit).toBeEnabled();
    fireEvent.click(independentSubmit);
    expect(independentIntercept).toHaveBeenCalledTimes(1);
    const independentPayload = independentIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expectExactPracticeEnvelope(independentPayload, independent.stableActivityId, 'independent_practice', independentAnswers);
    expectNoAuthority(independentPayload);
    independentView.unmount();
  });
});
