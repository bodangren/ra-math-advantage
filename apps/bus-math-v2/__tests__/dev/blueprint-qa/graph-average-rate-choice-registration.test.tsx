import fs from 'node:fs';
import path from 'node:path';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const pageDataMock = vi.hoisted(() => ({ fetchGraphData: vi.fn() }));

vi.mock('@/app/(dev)/blueprint-qa/data', () => pageDataMock);
vi.mock('next/navigation', () => ({ notFound: vi.fn() }));

import { clearActivityRegistry, getActivityComponent } from '@math-platform/activity-components/registry';
import type { ProjectedActivity } from '@math-platform/knowledge-space-practice';
import { practiceSubmissionEnvelopeSchema } from '@math-platform/practice-core/contract';
import BlueprintQAPage from '@/app/(dev)/blueprint-qa/page';
import { RendererPreview, getStudentPreviewProblem } from '@/app/(dev)/blueprint-qa/components/RendererPreview';
import { ensureActivitiesRegistered } from '@/app/(dev)/blueprint-qa/components/register-activities';

const NODE_ID = 'math.precalc.skill.1.2.compute-and-interpret-average-rate-of-change';
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

function loadPageGraphData() {
  const read = (fileName: string) => JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), `../pre-calculus/curriculum/skill-graph/${fileName}`), 'utf8'),
  ) as { nodes?: Array<Record<string, unknown>>; blueprints?: Array<Record<string, unknown>> };
  const nodes = read('nodes.json').nodes ?? [];
  const blueprints = read('blueprints.json').blueprints ?? [];
  const node = nodes.find((candidate) => candidate.id === NODE_ID);
  const blueprint = blueprints.find((candidate) => candidate.nodeId === NODE_ID);
  if (!node || !blueprint) throw new Error('The AP graph fixture is incomplete.');
  return {
    courseKey: 'precalc',
    courseLabel: 'AP Precalculus',
    nodes: [node],
    blueprints: [blueprint],
    activities: loadActivities(),
    sourceDocuments: [],
  };
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
    title: 'Compute and interpret the average rate of change',
    domain: 'mathematics',
    reviewStatus: 'draft',
    metadata: { course: 'precalc', unit: '1', lesson: '2' },
  };
}

const BANNED_PROPS_KEYS = /normalizedAnswer|correctAnswer|answerKey|hidden|authority|correctOptionId|expectedAnswer|isCorrect|score|maxScore|grading|solution|finalAnswer/i;
const BANNED_PAYLOAD_KEYS = /normalizedAnswer|correctAnswer|answerKey|hidden|authority|correctOptionId|expectedAnswer|isCorrect|score|maxScore|grading|solution|steps|finalAnswer/i;

describe('Business Math QA graph-average-rate-choice registration', () => {
  it('registers and previews the current AP Topic 1.2 Worked, Guided, and Independent rows', async () => {
    const activities = loadActivities();
    expect(activities.map((activity) => activity.mode)).toEqual([
      'worked_example',
      'guided_practice',
      'independent_practice',
    ]);

    clearActivityRegistry();
    ensureActivitiesRegistered();
    expect(getActivityComponent('graph-average-rate-choice')).toBeTruthy();

    for (const activity of activities) {
      expect(getStudentPreviewProblem(activity)).toBeNull();
      if (activity.mode !== 'worked_example') {
        expect(JSON.stringify(activity.props)).not.toMatch(BANNED_PROPS_KEYS);
      }
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
    const workedGraph = await screen.findByRole('img', { name: /h\(2\)=6.*h\(3\)=6.*h\(5\)=4.*h\(7\)=6.*h\(8\)=3/i });
    expect(workedGraph).toBeInTheDocument();
    expect(screen.getByText(worked.props.prompt as string)).toBeInTheDocument();
    expect(screen.getByText(worked.props.finalAnswer as string)).toBeInTheDocument();
    expect(screen.getByTestId('graph-x-ticks').textContent).toContain('2');
    expect(screen.getByTestId('graph-x-ticks').textContent).toContain('3');
    expect(screen.getByTestId('graph-x-ticks').textContent).toContain('5');
    expect(screen.getByTestId('graph-x-ticks').textContent).toContain('7');
    expect(screen.getByTestId('graph-x-ticks').textContent).toContain('8');
    expect(Array.from(screen.getByTestId('graph-y-ticks').querySelectorAll('text'), (tick) => tick.textContent)).toEqual(['0', '2', '4', '6', '8', '10', '11']);
    const workedRadios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(workedRadios).toHaveLength(4);
    expect(workedRadios.every((radio) => radio.disabled)).toBe(true);
    expect(screen.getByRole('radio', { name: /C.*5 to 7/ })).toBeChecked();
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
    expect(screen.getByText('Use the endpoint values for each interval.')).toBeInTheDocument();
    const guidedSubmit = screen.getByRole('button', { name: /submit/i }) as HTMLButtonElement;
    expect(guidedSubmit.disabled).toBe(true);
    fireEvent.click(screen.getAllByRole('radio')[0]!);
    expect(guidedSubmit.disabled).toBe(false);
    fireEvent.click(guidedSubmit);
    await waitFor(() => expect(guidedIntercept).toHaveBeenCalledTimes(1));
    const guidedPayload = guidedIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expect(guidedPayload).toMatchObject({
      contractVersion: 'practice.v1',
      activityId: guided.stableActivityId,
      mode: 'guided_practice',
      status: 'submitted',
      answers: { selectedOptionId: expect.any(String) },
    });
    expect(guidedPayload.parts).toEqual([{ partId: 'selectedOptionId', rawAnswer: expect.any(String) }]);
    expect(JSON.stringify(guidedPayload)).not.toMatch(BANNED_PAYLOAD_KEYS);
    expect(() => practiceSubmissionEnvelopeSchema.parse(guidedPayload)).not.toThrow();
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
    expect(screen.queryByText('Use the endpoint values for each interval.')).toBeNull();
    expect(screen.queryByText(/greatest average rate is.*option C/i)).toBeNull();
    const independentSubmit = screen.getByRole('button', { name: /submit/i }) as HTMLButtonElement;
    expect(independentSubmit.disabled).toBe(true);
    fireEvent.click(screen.getAllByRole('radio')[0]!);
    expect(independentSubmit.disabled).toBe(false);
    fireEvent.click(independentSubmit);
    await waitFor(() => expect(independentIntercept).toHaveBeenCalledTimes(1));
    const independentPayload = independentIntercept.mock.calls[0]![0]!.rawAnswer as Record<string, unknown>;
    expect(independentPayload).toMatchObject({
      contractVersion: 'practice.v1',
      activityId: independent.stableActivityId,
      mode: 'independent_practice',
      status: 'submitted',
      answers: { selectedOptionId: expect.any(String) },
    });
    expect(independentPayload.parts).toEqual([{ partId: 'selectedOptionId', rawAnswer: expect.any(String) }]);
    expect(JSON.stringify(independentPayload)).not.toMatch(BANNED_PAYLOAD_KEYS);
    expect(() => practiceSubmissionEnvelopeSchema.parse(independentPayload)).not.toThrow();
    independentView.unmount();
  });

  it('clears the submission log when the actual QA page changes modality', async () => {
    pageDataMock.fetchGraphData.mockResolvedValue(loadPageGraphData());
    ensureActivitiesRegistered();
    render(<BlueprintQAPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'AP Precalculus' }));
    fireEvent.click(await screen.findByRole('tab', { name: 'Guided' }));
    fireEvent.click((await screen.findAllByRole('radio'))[0]!);
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(await screen.findByText('Submission log')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Independent' }));
    expect(screen.queryByText('Submission log')).toBeNull();
  });
});
