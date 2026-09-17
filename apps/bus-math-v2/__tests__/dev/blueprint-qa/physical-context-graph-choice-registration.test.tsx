import { describe, expect, it } from 'vitest';

import {
  clearActivityRegistry,
  getActivityComponent,
} from '@math-platform/activity-components/registry';
import type { ProjectedActivity } from '@math-platform/knowledge-space-practice';
import { getStudentPreviewProblem } from '@/app/(dev)/blueprint-qa/components/RendererPreview';
import { ensureActivitiesRegistered } from '@/app/(dev)/blueprint-qa/components/register-activities';

const sharedProps = {
  prompt: 'Select the graph that models the filling vase.',
  contextDescription: 'Water enters an empty vase at a constant rate.',
  xLabel: 'Time',
  yLabel: 'Water height',
  containerProfile: 'narrow-wide-narrow',
  options: [
    { id: 'A', label: 'A', shape: 'linear-increasing', accessibleDescription: 'A straight line rises at a constant rate.' },
    { id: 'B', label: 'B', shape: 'slope-increases-then-decreases', accessibleDescription: 'The slope increases and then decreases.' },
    { id: 'C', label: 'C', shape: 'rise-fall-rise', accessibleDescription: 'The graph rises, falls, and rises again.' },
    { id: 'D', label: 'D', shape: 'steep-gentle-steep', accessibleDescription: 'The graph rises steeply, then gently, then steeply.' },
  ],
};

const fixtures = [
  {
    ...sharedProps,
    presentationMode: 'worked_example' as const,
    correctOptionId: 'D',
    steps: ['Identify time as the independent variable.', 'Compare each graph shape with the physical context.'],
    finalAnswer: 'Graph D.',
  },
  {
    ...sharedProps,
    presentationMode: 'guided_practice' as const,
    guidedSteps: ['Identify the variables.', 'Compare the graph shapes.'],
    fieldHelp: 'Select the graph that fits the context.',
  },
  {
    ...sharedProps,
    presentationMode: 'independent_practice' as const,
  },
];

function makeActivity(
  mode: ProjectedActivity['mode'],
  props: Record<string, unknown>,
): ProjectedActivity {
  return {
    stableActivityId: `math.precalc.example.1.1.001.${mode}`,
    nodeId: 'math.precalc.skill.1.1.select-a-graph-that-models-a-physical-context',
    sourceNodeIds: ['math.precalc.example.1.1.001'],
    rendererKey: 'physical-context-graph-choice',
    mode,
    alignmentNodeIds: ['math.standard.ccss.hsf-if-b-4'],
    props,
    gradingConfig: {},
    srsEligible: false,
  };
}

describe('Business Math QA physical-context graph-choice registration', () => {
  it('registers the shared component and accepts strict Worked, Guided, and Independent fixtures', () => {
    clearActivityRegistry();
    ensureActivitiesRegistered();

    expect(getActivityComponent('physical-context-graph-choice')).toBeTruthy();
    const modes: ProjectedActivity['mode'][] = ['worked_example', 'guided_practice', 'independent_practice'];
    for (const [index, mode] of modes.entries()) {
      expect(getStudentPreviewProblem(makeActivity(mode, fixtures[index]!))).toBeNull();
    }
  });
});
