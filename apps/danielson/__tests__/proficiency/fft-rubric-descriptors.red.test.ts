import { describe, expect, it } from 'vitest';

import {
  FFT_2022_RATING_LEVELS,
  FFT_2022_RUBRIC_DESCRIPTORS,
} from '../../lib/proficiency/fft-rubric-descriptors';
import { DANIELSON_COMPONENT_IDS } from '../../lib/proficiency/graph';

describe('FFT 2022 rubric descriptors', () => {
  it('contains each rating descriptor for all 22 components', () => {
    expect(Object.keys(FFT_2022_RUBRIC_DESCRIPTORS)).toEqual(DANIELSON_COMPONENT_IDS);
    expect(FFT_2022_RATING_LEVELS).toEqual([
      { id: 'unsatisfactory', score: 1, label: 'Unsatisfactory' },
      { id: 'basic', score: 2, label: 'Basic' },
      { id: 'proficient', score: 3, label: 'Proficient' },
      { id: 'distinguished', score: 4, label: 'Distinguished' },
    ]);

    for (const componentId of DANIELSON_COMPONENT_IDS) {
      const component = FFT_2022_RUBRIC_DESCRIPTORS[componentId];
      expect(component.id).toBe(componentId);
      expect(component.title.length).toBeGreaterThan(0);
      for (const level of FFT_2022_RATING_LEVELS) {
        expect(component.descriptors[level.id].length).toBeGreaterThan(0);
      }
    }
  });

  it('preserves the supplied component-specific wording', () => {
    expect(FFT_2022_RUBRIC_DESCRIPTORS['1a'].descriptors.unsatisfactory).toBe(
      'The teacher lacks sufficient knowledge of content and pedagogy to support student learning of the content.',
    );
    expect(FFT_2022_RUBRIC_DESCRIPTORS['4f'].descriptors.distinguished).toContain(
      'The teacher is a leader in the school in defining and upholding high standards of ethical practice',
    );
  });
});
