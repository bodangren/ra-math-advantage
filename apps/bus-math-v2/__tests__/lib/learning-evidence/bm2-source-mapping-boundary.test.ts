import { describe, expect, it } from 'vitest';
import { isBm2PilotSourcePublished } from '@/lib/learning-evidence/bm2-pilot';
import { buildPublishedCurriculumManifest } from '@/lib/curriculum/published-manifest';

describe('BM2 source mapping boundary', () => {
  it('keeps the notebook in its lesson without accepting it as exact event-analysis exposure', () => {
    const lesson = buildPublishedCurriculumManifest().lessons.find((row) => row.slug === 'unit-1-lesson-1');
    expect(lesson?.activities.find((row) => row.key === 'unit-1-lesson-1-activity-1')?.componentKey).toBe('notebook-organizer');
    expect(isBm2PilotSourcePublished()).toBe(false);
  });
});
