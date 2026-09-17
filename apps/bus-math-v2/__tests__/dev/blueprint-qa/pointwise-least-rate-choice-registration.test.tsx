import fs from 'node:fs';
import path from 'node:path';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { clearActivityRegistry, getActivityComponent } from '@math-platform/activity-components/registry';
import type { ProjectedActivity } from '@math-platform/knowledge-space-practice';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import { RendererPreview, getStudentPreviewProblem } from '@/app/(dev)/blueprint-qa/components/RendererPreview';
import { ensureActivitiesRegistered } from '@/app/(dev)/blueprint-qa/components/register-activities';

const NODE_ID = 'math.precalc.skill.1.2.identify-least-pointwise-rate-of-change-from-graphs';
const AP_PROJECTION_PATH = path.resolve(
  process.cwd(),
  '../pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json',
);
const BANNED_PROPS_KEYS = /correctAnswer|answerKey|hidden|authority|correctOptionId|expectedAnswer|isCorrect|score|maxScore|grading|solution|finalAnswer|slope|derivative/i;
const BANNED_PAYLOAD_KEYS = /correctAnswer|answerKey|hidden|authority|correctOptionId|expectedAnswer|isCorrect|score|maxScore|grading|solution|steps|finalAnswer|slope|derivative/i;

function loadActivities(): ProjectedActivity[] {
  const document = JSON.parse(fs.readFileSync(AP_PROJECTION_PATH, 'utf8')) as {
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
    title: 'Identify the least pointwise rate of change from a graph',
    domain: 'mathematics',
    reviewStatus: 'draft',
    metadata: { course: 'precalc', unit: '1', lesson: '2' },
  };
}

describe('Business Math QA pointwise-least-rate-choice registration', () => {
  it('registers and previews the three exact AP Topic 1.2 modes', async () => {
    const activities = loadActivities();
    expect(activities).toHaveLength(3);
    expect(activities.map((activity) => activity.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);

    clearActivityRegistry();
    ensureActivitiesRegistered();
    expect(getActivityComponent('pointwise-least-rate-choice')).toBeTruthy();
    for (const activity of activities) {
      expect(getStudentPreviewProblem(activity)).toBeNull();
    }

    const worked = activities[0]!;
    const workedView = render(
      <RendererPreview
        state={makeState('worked_example', 0)}
        selectedNode={makeNode()}
        activity={worked}
        onIntercept={vi.fn()}
      />,
    );
    const workedGraph = await screen.findByRole('img', { name: /least instantaneous rate of change/i });
    expect(workedGraph).toBeInTheDocument();
    expect(screen.getByTitle('Graph of y with four labeled points.')).toBeInTheDocument();
    expect(workedGraph.querySelector('desc')?.textContent).toContain(
      'A(-3.5, -1.2), B(-1, 1), C(2.3, 2.3), D(4, -1)',
    );
    expect(screen.getByTestId('pointwise-axes').getAttribute('d')).toBe('M42 80H346M194 146V14');
    expect(screen.getByText((worked.props as { prompt: string }).prompt)).toBeInTheDocument();
    expect(screen.getByText('Point D has the least rate of change (option D).')).toBeInTheDocument();
    for (const point of [
      { label: 'A', x: -3.5, y: -1.2 },
      { label: 'B', x: -1, y: 1 },
      { label: 'C', x: 2.3, y: 2.3 },
      { label: 'D', x: 4, y: -1 },
    ]) {
      const label = screen.getByTestId(`point-label-${point.label}`);
      expect(label).toHaveAttribute('data-point-x', String(point.x));
      expect(label).toHaveAttribute('data-point-y', String(point.y));
    }
    const workedRadios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(workedRadios).toHaveLength(4);
    expect(workedRadios.every((radio) => radio.disabled)).toBe(true);
    expect(screen.getByRole('radio', { name: /^D/ })).toBeChecked();
    expect(screen.queryByRole('button', { name: /submit/i })).toBeNull();
    workedView.unmount();

    const guided = activities.find((activity) => activity.mode === 'guided_practice')!;
    const guidedIntercept = vi.fn();
    const guidedView = render(
      <RendererPreview
        state={makeState('guided_practice', 1)}
        selectedNode={makeNode()}
        activity={guided}
        onIntercept={guidedIntercept}
      />,
    );
    expect(await screen.findByRole('img')).toBeInTheDocument();
    expect(screen.getByText('A steeper downward graph has a smaller rate of change.')).toBeInTheDocument();
    expect(JSON.stringify(guided.props)).not.toMatch(BANNED_PROPS_KEYS);
    const guidedSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(guidedSubmit).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: /^A/ }));
    expect(guidedSubmit).toBeEnabled();
    fireEvent.click(guidedSubmit);
    await waitFor(() => expect(guidedIntercept).toHaveBeenCalledTimes(1));
    const guidedPayload = guidedIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expect(guidedPayload).toMatchObject({
      contractVersion: 'practice.v1',
      activityId: guided.stableActivityId,
      mode: 'guided_practice',
      status: 'submitted',
      answers: { selectedOptionId: 'A' },
    });
    expect(guidedPayload.parts).toEqual([{ partId: 'selectedOptionId', rawAnswer: 'A' }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(guidedPayload)).not.toThrow();
    expect(JSON.stringify(guidedPayload)).not.toMatch(BANNED_PAYLOAD_KEYS);
    guidedView.unmount();

    const independent = activities.find((activity) => activity.mode === 'independent_practice')!;
    const independentIntercept = vi.fn();
    const independentView = render(
      <RendererPreview
        state={makeState('independent_practice', 2)}
        selectedNode={makeNode()}
        activity={independent}
        onIntercept={independentIntercept}
      />,
    );
    expect(await screen.findByRole('img')).toBeInTheDocument();
    expect(screen.queryByText('A steeper downward graph has a smaller rate of change.')).toBeNull();
    expect(screen.queryByText(/Point D has the least rate of change/i)).toBeNull();
    expect(JSON.stringify(independent.props)).not.toMatch(BANNED_PROPS_KEYS);
    const independentSubmit = screen.getByRole('button', { name: 'Submit answer' }) as HTMLButtonElement;
    expect(independentSubmit).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: /^B/ }));
    expect(independentSubmit).toBeEnabled();
    fireEvent.click(independentSubmit);
    await waitFor(() => expect(independentIntercept).toHaveBeenCalledTimes(1));
    const independentPayload = independentIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expect(independentPayload).toMatchObject({
      contractVersion: 'practice.v1',
      activityId: independent.stableActivityId,
      mode: 'independent_practice',
      status: 'submitted',
      answers: { selectedOptionId: 'B' },
    });
    expect(independentPayload.parts).toEqual([{ partId: 'selectedOptionId', rawAnswer: 'B' }]);
    expect(() => practiceSubmissionEnvelopeSchema.parse(independentPayload)).not.toThrow();
    expect(JSON.stringify(independentPayload)).not.toMatch(BANNED_PAYLOAD_KEYS);
    independentView.unmount();
  });
});
