import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BM2_PILOT_NODE } from '@/lib/learning-evidence/bm2-pilot';
import { buildPublishedCurriculumSeedPlan } from '@/lib/curriculum/published-manifest';

const root = path.resolve(process.cwd(), 'curriculum/skill-graph');
describe('Business Math capability and evidence graph', () => {
  it('covers published lessons and standards with named capabilities', () => {
    const graph = JSON.parse(fs.readFileSync(path.join(root, 'nodes.json'), 'utf8'));
    expect(graph.nodes.some((node: { id: string }) => node.id === BM2_PILOT_NODE)).toBe(true);
    const lessons = buildPublishedCurriculumSeedPlan().lessons;
    for (const lesson of lessons) {
      const nodes = graph.nodes.filter((node: { metadata: { lessonSlug: string } }) => node.metadata.lessonSlug === lesson.slug);
      expect(nodes.length, lesson.slug).toBeGreaterThan(0);
      for (const standard of lesson.standards) {
        expect(graph.nodes.some((node: { metadata: { standardCodes: string[] } }) => node.metadata.standardCodes.includes(standard.code)), standard.code).toBe(true);
      }
    }
    expect(JSON.stringify(graph)).not.toMatch(/Published curriculum standard|Demonstrate mastery for|family-registry/);
  });
  it('has valid, acyclic prerequisite edges with an instructional reason', () => {
    const { nodes } = JSON.parse(fs.readFileSync(path.join(root, 'nodes.json'), 'utf8'));
    const { edges } = JSON.parse(fs.readFileSync(path.join(root, 'edges.json'), 'utf8'));
    const ids = new Set(nodes.map((node: { id: string }) => node.id));
    const following = new Map<string, string[]>();
    for (const edge of edges) {
      expect(ids.has(edge.from)).toBe(true); expect(ids.has(edge.to)).toBe(true);
      expect(edge.rationale.length).toBeGreaterThan(20);
      following.set(edge.from, [...following.get(edge.from) ?? [], edge.to]);
    }
    const visit = (id: string, ancestors: Set<string>) => {
      expect(ancestors.has(id), `Cycle at ${id}`).toBe(false);
      for (const next of following.get(id) ?? []) visit(next, new Set([...ancestors, id]));
    };
    for (const id of ids) visit(String(id), new Set());
  });
  it('maps actual authored activities and keeps manual evidence separate from automatic mastery', () => {
    const { nodes } = JSON.parse(fs.readFileSync(path.join(root, 'nodes.json'), 'utf8'));
    const { activities } = JSON.parse(fs.readFileSync(path.join(root, 'projection/practice-v1-activity-map.json'), 'utf8'));
    const plan = buildPublishedCurriculumSeedPlan();
    const actual = new Map(plan.lessons.flatMap(lesson => lesson.activities.map(activity => [activity.key, activity] as const)));
    const nodeIds = new Set(nodes.map((node: { id: string }) => node.id));
    for (const projection of activities) {
      const activity = actual.get(projection.stableActivityId);
      expect(activity, projection.stableActivityId).toBeDefined();
      expect(nodeIds.has(projection.nodeId), projection.nodeId).toBe(true);
      expect(projection.rendererKey).toBe(activity?.componentKey);
      expect(projection.props).toEqual(activity?.props);
      expect(projection.gradingConfig).toEqual(activity?.gradingConfig ?? {});
      expect(projection.srsEligible).toBe(false);
    }
    expect(new Set(activities.map((activity: { stableActivityId: string }) => activity.stableActivityId)).size)
      .toBe(activities.length);

    const lessonOne = plan.lessons.find((lesson) => lesson.slug === 'unit-1-lesson-1');
    const lessonOneActivityIds = lessonOne?.activities.map((activity) => activity.key) ?? [];
    expect(lessonOneActivityIds).toEqual(expect.arrayContaining([
      'unit-1-lesson-1-activity-1',
      'unit-1-lesson-1-activity-2',
      'unit-1-lesson-1-activity-3',
    ]));
    expect(activities.filter((activity: { stableActivityId: string }) => (
      lessonOneActivityIds.includes(activity.stableActivityId)
    ))).toEqual([]);
  });
});
