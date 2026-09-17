import { describe, it, expect } from 'vitest';
import { buildPublishedCurriculumManifest } from '@/lib/curriculum/published-manifest';
const lessons = buildPublishedCurriculumManifest().lessons;
describe('complete curriculum work', () => {
 it.each(lessons.map((lesson) => [lesson.slug, lesson] as const))('%s has required assessable work', (_slug, lesson) => {
  expect(lesson.activities.length).toBeGreaterThan(0);
  const activityIds = new Set(lesson.activities.map((activity) => activity.key));
  const linked = lesson.phases.flatMap((phase) => phase.sections).filter((section) => section.sectionType === 'activity');
  expect(linked.length).toBeGreaterThan(0);
  for (const section of linked) expect(activityIds.has(String(section.content.activityId))).toBe(true);
 });
});
