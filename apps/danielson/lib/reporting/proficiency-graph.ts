import type { CurrentProficiency, ReportingState } from "./contracts";

export type ProficiencyGraphNodeKind = "framework" | "domain" | "component" | "skill";
export type ProficiencyScoreBand = "red" | "yellow" | "green" | "blue" | "neutral";

export type ProficiencyGraphNode = {
  id: string;
  kind: ProficiencyGraphNodeKind;
  title: string;
  state: ReportingState;
  x: number;
  y: number;
  displayScore: number | null;
  scoreBand: ProficiencyScoreBand;
  rawRating?: 1 | 2 | 3 | 4 | null;
  points?: 70 | 80 | 90 | 100 | null;
  due?: boolean;
  dueAt?: string | null;
  overdueDays?: number;
  sourceRecordId?: string | null;
  priorityRank?: 1 | 2 | 3;
  priorityReason?: CurrentProficiency["priorityTargets"][number]["reason"];
  evidenceHref?: string;
};

export type ProficiencyGraphEdge = {
  id: string;
  kind: "contains";
  sourceId: string;
  targetId: string;
};

export type ProficiencyGraphModel = {
  nodes: ProficiencyGraphNode[];
  edges: ProficiencyGraphEdge[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number };
};

const DOMAIN_RADIUS = 260;
const COMPONENT_RADIUS = 520;
const SKILL_RADIUS = 780;

function point(radius: number, angle: number) {
  return { x: Math.round(Math.cos(angle) * radius), y: Math.round(Math.sin(angle) * radius) };
}

function skillNodeId(skillId: string) {
  return skillId.startsWith("danielson.tlac.skill.") ? skillId : `danielson.tlac.skill.${skillId}`;
}

function edge(sourceId: string, targetId: string): ProficiencyGraphEdge {
  return {
    id: `contains:${sourceId}:${targetId}`,
    kind: "contains",
    sourceId,
    targetId,
  };
}

function bounds(nodes: readonly ProficiencyGraphNode[]) {
  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

function componentAngle(domainIndex: number, componentIndex: number, componentCount: number) {
  const domainAngle = -Math.PI / 2 + (domainIndex * Math.PI * 2) / 4;
  const arc = Math.PI / 2.8;
  const offset = componentCount === 1 ? 0 : (componentIndex / (componentCount - 1) - 0.5) * arc;
  return domainAngle + offset;
}

function meanScore(values: readonly number[]) {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function roundScore(score: number | null) {
  return score === null ? null : Math.round(score * 10) / 10;
}

function componentScore(component: CurrentProficiency["domains"][number]["components"][number]) {
  const skillRatings = component.skills.flatMap((skill) =>
    skill.rawRating === null ? [] : [skill.rawRating],
  );
  return skillRatings.length > 0 ? meanScore(skillRatings) : component.rawRating;
}

function scoreBand(score: number | null): ProficiencyScoreBand {
  if (score === null) return "neutral";
  if (score < 2) return "red";
  if (score < 3) return "yellow";
  if (score < 4) return "green";
  return "blue";
}

function makeSkillNode(
  skill: CurrentProficiency["domains"][number]["components"][number]["skills"][number],
  target: CurrentProficiency["priorityTargets"][number] | undefined,
  position: { x: number; y: number },
): ProficiencyGraphNode {
  const id = skillNodeId(skill.skillId);
  const displayScore = skill.rawRating;
  return {
    id,
    kind: "skill",
    title: skill.title,
    state: skill.state,
    x: position.x,
    y: position.y,
    displayScore,
    scoreBand: scoreBand(displayScore),
    rawRating: skill.rawRating,
    points: skill.points,
    due: skill.due,
    dueAt: skill.dueAt,
    overdueDays: skill.overdueDays,
    sourceRecordId: skill.sourceRecordId,
    ...(target ? { priorityRank: target.rank, priorityReason: target.reason } : {}),
    ...(skill.sourceRecordId
      ? { evidenceHref: `/observations/records/${encodeURIComponent(skill.sourceRecordId)}` }
      : {}),
  };
}

/** Build the deterministic presentation model for the current proficiency report. */
export function buildProficiencyGraphModel(
  current: CurrentProficiency,
  options: { expandedComponentId?: string } = {},
): ProficiencyGraphModel {
  const componentScores = new Map(
    current.domains.flatMap((domain) =>
      domain.components.map(
        (component) => [component.componentId, componentScore(component)] as const,
      ),
    ),
  );
  const frameworkScore = roundScore(
    meanScore([...componentScores.values()].flatMap((score) => (score === null ? [] : [score]))),
  );
  const nodes: ProficiencyGraphNode[] = [
    {
      id: "danielson.framework.2022",
      kind: "framework",
      title: "Framework for Teaching 2022",
      state: current.state,
      x: 0,
      y: 0,
      displayScore: frameworkScore,
      scoreBand: scoreBand(frameworkScore),
    },
  ];
  const edges: ProficiencyGraphEdge[] = [];
  const targets = new Map(
    current.priorityTargets.map((target) => [skillNodeId(target.skillId), target]),
  );

  current.domains.forEach((domain, domainIndex) => {
    const domainId = domain.domainId;
    const domainPosition = point(DOMAIN_RADIUS, -Math.PI / 2 + (domainIndex * Math.PI * 2) / 4);
    const displayScore = roundScore(
      meanScore(
        domain.components.flatMap((component) => {
          const score = componentScores.get(component.componentId);
          return score === null || score === undefined ? [] : [score];
        }),
      ),
    );
    nodes.push({
      id: domainId,
      kind: "domain",
      title: domain.title,
      state: domain.state,
      displayScore,
      scoreBand: scoreBand(displayScore),
      ...domainPosition,
    });
    edges.push(edge("danielson.framework.2022", domainId));

    domain.components.forEach((component, componentIndex) => {
      const componentId = component.componentId;
      const angle = componentAngle(domainIndex, componentIndex, domain.components.length);
      const componentPosition = point(COMPONENT_RADIUS, angle);
      const displayScore = roundScore(componentScores.get(componentId) ?? null);
      nodes.push({
        id: componentId,
        kind: "component",
        title: component.title,
        state: component.state,
        displayScore,
        scoreBand: scoreBand(displayScore),
        rawRating: component.rawRating,
        points: component.points,
        sourceRecordId: component.sourceRecordId,
        ...(component.sourceRecordId
          ? {
              evidenceHref: `/observations/records/${encodeURIComponent(component.sourceRecordId)}`,
            }
          : {}),
        ...componentPosition,
      });
      edges.push(edge(domainId, componentId));

      if (options.expandedComponentId !== componentId) return;
      const skillArc = Math.PI / 2.6;
      component.skills.forEach((skill, skillIndex) => {
        const skillAngle =
          component.skills.length === 1
            ? angle
            : angle + (skillIndex / (component.skills.length - 1) - 0.5) * skillArc;
        const node = makeSkillNode(
          skill,
          targets.get(skillNodeId(skill.skillId)),
          point(SKILL_RADIUS, skillAngle),
        );
        nodes.push(node);
        edges.push(edge(componentId, node.id));
      });
    });
  });

  return { nodes, edges, bounds: bounds(nodes) };
}
