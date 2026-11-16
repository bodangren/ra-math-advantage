import { describe, expect, it } from 'vitest';

import {
  physicalContextGraphChoiceSchema,
  SCHEMA_REGISTRY,
} from '../index';

const options = [
  {
    id: 'A',
    label: 'Graph A',
    shape: 'linear-increasing',
    accessibleDescription: 'A straight line that rises at a constant rate.',
  },
  {
    id: 'B',
    label: 'Graph B',
    shape: 'slope-increases-then-decreases',
    accessibleDescription: 'A graph that stays increasing while its slope increases and then decreases.',
  },
  {
    id: 'C',
    label: 'Graph C',
    shape: 'rise-fall-rise',
    accessibleDescription: 'A graph that rises, then falls, then rises again.',
  },
  {
    id: 'D',
    label: 'Graph D',
    shape: 'steep-gentle-steep',
    accessibleDescription: 'A graph that rises steeply, then gently, then steeply.',
  },
] as const;

const sharedProps = {
  title: 'Select the graph for a filling vase',
  prompt: 'Select the graph that models the water height in the vase.',
  contextDescription: 'An empty vase fills with water at a constant rate from t = 0.',
  xLabel: 'Time',
  yLabel: 'Water height',
  containerProfile: 'narrow-wide-narrow' as const,
  options,
};

const workedProps = {
  ...sharedProps,
  presentationMode: 'worked_example' as const,
  correctOptionId: 'D',
  steps: [
    'Time is independent and water height is dependent.',
    'The changing vase width makes the height increase at a changing rate.',
  ],
  finalAnswer: 'Graph D models the filling vase.',
};

const guidedProps = {
  ...sharedProps,
  presentationMode: 'guided_practice' as const,
  guidedSteps: [
    'Identify the independent and dependent variables.',
    'Compare each graph shape with the changing vase width.',
  ],
  fieldHelp: 'Choose the graph whose shape fits the context.',
};

const independentProps = {
  ...sharedProps,
  presentationMode: 'independent_practice' as const,
};

describe('physicalContextGraphChoiceSchema', () => {
  it('accepts the strict Worked, Guided, and Independent fixtures', () => {
    expect(physicalContextGraphChoiceSchema.safeParse(workedProps).success).toBe(true);
    expect(physicalContextGraphChoiceSchema.safeParse(guidedProps).success).toBe(true);
    expect(physicalContextGraphChoiceSchema.safeParse(independentProps).success).toBe(true);
  });

  it('accepts each container profile and requires it in every mode', () => {
    const profiles = ['constant-width', 'wide-narrow-wide', 'narrow-wide-narrow'] as const;
    for (const profile of profiles) {
      for (const fixture of [workedProps, guidedProps, independentProps]) {
        expect(physicalContextGraphChoiceSchema.safeParse({ ...fixture, containerProfile: profile }).success)
          .toBe(true);
      }
    }

    for (const fixture of [workedProps, guidedProps, independentProps]) {
      const { containerProfile: _containerProfile, ...missingProfile } = fixture;
      expect(physicalContextGraphChoiceSchema.safeParse(missingProfile).success).toBe(false);
      expect(physicalContextGraphChoiceSchema.safeParse({
        ...fixture,
        containerProfile: 'unknown-profile',
      }).success).toBe(false);
    }
  });

  it('requires exactly four options', () => {
    expect(physicalContextGraphChoiceSchema.safeParse({
      ...independentProps,
      options: options.slice(0, 3),
    }).success).toBe(false);
    expect(physicalContextGraphChoiceSchema.safeParse({
      ...independentProps,
      options: [...options, { ...options[0], id: 'E', shape: 'linear-increasing' }],
    }).success).toBe(false);
  });

  it('requires unique option IDs and shapes', () => {
    expect(physicalContextGraphChoiceSchema.safeParse({
      ...independentProps,
      options: options.map((option, index) => index === 1 ? { ...option, id: 'A' } : option),
    }).success).toBe(false);
    expect(physicalContextGraphChoiceSchema.safeParse({
      ...independentProps,
      options: options.map((option, index) => index === 1 ? { ...option, shape: 'linear-increasing' } : option),
    }).success).toBe(false);
  });

  it('requires a Worked answer to match an option', () => {
    expect(physicalContextGraphChoiceSchema.safeParse({
      ...workedProps,
      correctOptionId: 'E',
    }).success).toBe(false);
  });

  it('rejects solution fields in Guided and Independent modes', () => {
    expect(physicalContextGraphChoiceSchema.safeParse({
      ...guidedProps,
      correctOptionId: 'D',
    }).success).toBe(false);
    expect(physicalContextGraphChoiceSchema.safeParse({
      ...independentProps,
      finalAnswer: 'Graph D',
    }).success).toBe(false);
    expect(physicalContextGraphChoiceSchema.safeParse({
      ...independentProps,
      steps: ['Do this.'],
    }).success).toBe(false);
  });

  it('registers the physical-context graph-choice schema', () => {
    expect(SCHEMA_REGISTRY['physical-context-graph-choice']).toBe(physicalContextGraphChoiceSchema);
  });
});
