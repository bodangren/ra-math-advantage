import { COURSE_GRAPH_DOCUMENTS } from "./graph-documents";
import { getSourceDocuments } from "./source-documents";
import type { ProjectedActivity } from "@math-platform/knowledge-space-practice";
import type { CourseKey, GraphData, ReviewBlueprint, SkillNode } from "./types";

interface NodesDocument {
  nodes: SkillNode[];
}

interface BlueprintsDocument {
  blueprints: ReviewBlueprint[];
}

interface ActivitiesDocument {
  activities: ProjectedActivity[];
}

export async function fetchGraphData(
  courseKey: CourseKey = "im3",
  request: typeof fetch = fetch,
): Promise<GraphData> {
  const course = COURSE_GRAPH_DOCUMENTS[courseKey];
  const [nodesResponse, blueprintsResponse, activitiesResponse] = await Promise.all([
    request(`/api/dev/curriculum-graph?course=${courseKey}&artifact=nodes`),
    request(`/api/dev/curriculum-graph?course=${courseKey}&artifact=blueprints`),
    request(`/api/dev/curriculum-graph?course=${courseKey}&artifact=activities`),
  ]);

  if (!nodesResponse.ok || !blueprintsResponse.ok || !activitiesResponse.ok) {
    throw new Error(`The ${course.label} graph files are unavailable.`);
  }

  const [nodesDocument, blueprintsDocument, activitiesDocument] = await Promise.all([
    nodesResponse.json() as Promise<NodesDocument>,
    blueprintsResponse.json() as Promise<BlueprintsDocument>,
    activitiesResponse.json() as Promise<ActivitiesDocument>,
  ]);

  return {
    courseKey,
    courseLabel: course.label,
    nodes: nodesDocument.nodes,
    blueprints: blueprintsDocument.blueprints,
    activities: activitiesDocument.activities,
    sourceDocuments: getSourceDocuments(courseKey),
  };
}
