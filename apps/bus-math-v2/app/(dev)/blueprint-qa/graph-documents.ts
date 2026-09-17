import type { CourseKey } from './types';

export type GraphCourseKey = CourseKey;
export type GraphArtifact = 'nodes' | 'blueprints' | 'activities';

interface CourseGraphDocuments {
  label: string;
  nodes: string;
  blueprints: string;
  activities: string;
}

export const COURSE_GRAPH_DOCUMENTS: Record<GraphCourseKey, CourseGraphDocuments> = {
  bm2: {
    label: 'Business Math',
    nodes: 'apps/bus-math-v2/curriculum/skill-graph/nodes.json',
    blueprints: 'apps/bus-math-v2/curriculum/skill-graph/blueprints.json',
    activities: 'apps/bus-math-v2/curriculum/skill-graph/projection/practice-v1-activity-map.json',
  },
  im1: {
    label: 'Integrated Math 1',
    nodes: 'apps/integrated-math-1/curriculum/skill-graph/nodes.json',
    blueprints: 'apps/integrated-math-1/curriculum/skill-graph/blueprints.json',
    activities: 'apps/integrated-math-1/curriculum/skill-graph/projection/practice-v1-activity-map.json',
  },
  im2: {
    label: 'Integrated Math 2',
    nodes: 'apps/integrated-math-2/curriculum/skill-graph/nodes.json',
    blueprints: 'apps/integrated-math-2/curriculum/skill-graph/blueprints.json',
    activities: 'apps/integrated-math-2/curriculum/skill-graph/projection/practice-v1-activity-map.json',
  },
  im3: {
    label: 'Integrated Math 3',
    nodes: 'apps/integrated-math-3/curriculum/skill-graph/nodes.json',
    blueprints: 'apps/integrated-math-3/curriculum/skill-graph/blueprints.json',
    activities: 'apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json',
  },
  precalc: {
    label: 'AP Precalculus',
    nodes: 'apps/pre-calculus/curriculum/skill-graph/nodes.json',
    blueprints: 'apps/pre-calculus/curriculum/skill-graph/blueprints.json',
    activities: 'apps/pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json',
  },
};

export function getGraphDocument(courseKey: string, artifact: string): string | undefined {
  if (
    !(courseKey in COURSE_GRAPH_DOCUMENTS)
    || (artifact !== 'nodes' && artifact !== 'blueprints' && artifact !== 'activities')
  ) {
    return undefined;
  }
  return COURSE_GRAPH_DOCUMENTS[courseKey as GraphCourseKey][artifact];
}
