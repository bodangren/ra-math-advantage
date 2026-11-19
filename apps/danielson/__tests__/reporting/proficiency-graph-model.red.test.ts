import { describe, expect, it } from "vitest";

import { projectCurrentProficiency } from "../../lib/reporting/projections";
import { buildDanielsonGraph } from "../../lib/proficiency/graph";
import { buildProficiencyGraphModel } from "../../lib/reporting/proficiency-graph";
import type { CurrentProficiency } from "../../lib/reporting/contracts";

function priorities() {
  const graph = buildDanielsonGraph().graph;
  const componentBySkill = new Map(
    graph.edges
      .filter((edge) => edge.type === "contains")
      .filter((edge) =>
        graph.nodes.some((node) => node.id === edge.targetId && node.kind === "skill"),
      )
      .map((edge) => [edge.targetId, edge.sourceId]),
  );
  return graph.nodes
    .filter((node) => node.kind === "skill")
    .map((node, index) => ({
      teacherId: "teacher_profiles:graph",
      skillId: node.id,
      componentId: componentBySkill.get(node.id),
      due: index === 0,
      dueAt: "2026-10-28T00:00:00.000Z",
      overdueDays: index === 0 ? 4 : 0,
      currentProficiency:
        index === 0
          ? { rawRating: 2, points: 80, passes: false }
          : { rawRating: 3, points: 90, passes: true },
      evidenceGaps: [],
      approvedPriorityInputs: ["current_proficiency", "due_status"],
      sourceRecordId: `observation_records:${encodeURIComponent(node.id)}`,
    }));
}

type Rating = 1 | 2 | 3 | 4;
type GraphComponent = CurrentProficiency["domains"][number]["components"][number];
const RATING_POINTS = { 1: 70, 2: 80, 3: 90, 4: 100 } as const;

function graphComponent(
  componentId: string,
  skillRatings: Rating[],
  formalRating: Rating | null = null,
): GraphComponent {
  const ratings =
    skillRatings.length > 0 ? skillRatings : formalRating === null ? [] : [formalRating];
  const state =
    ratings.length === 0
      ? "not_enough_evidence"
      : ratings.some((rating) => rating < 3)
        ? "below_proficient"
        : "proficient";
  const shortId = componentId.split(".").at(-1);
  return {
    componentId,
    title: shortId ?? componentId,
    state,
    rawRating: formalRating,
    points: formalRating === null ? null : RATING_POINTS[formalRating],
    sourceRecordId: formalRating === null ? null : `observation:${shortId}`,
    skills: skillRatings.map((rating, index) => ({
      skillId: `danielson.tlac.skill.${shortId}-${index}`,
      title: `${shortId} skill ${index + 1}`,
      rawRating: rating,
      points: RATING_POINTS[rating],
      state: rating < 3 ? "below_proficient" : "proficient",
      due: false,
      dueAt: null,
      overdueDays: 0,
      sourceRecordId: `observation:${shortId}-${index}`,
    })),
  };
}

describe("teacher proficiency graph model", () => {
  it("calculates one-decimal scores and color bands from existing ratings", () => {
    const current: CurrentProficiency = {
      state: "below_proficient",
      priorityTargets: [],
      domains: [
        {
          domainId: "danielson.framework.domain.1",
          title: "Domain 1",
          state: "below_proficient",
          components: [
            graphComponent("danielson.framework.component.1a", [1, 1, 1, 2]),
            graphComponent("danielson.framework.component.1b", [], 4),
          ],
        },
        {
          domainId: "danielson.framework.domain.2",
          title: "Domain 2",
          state: "proficient",
          components: [
            graphComponent("danielson.framework.component.2a", [3, 4]),
            graphComponent("danielson.framework.component.2b", []),
          ],
        },
      ],
    };

    const model = buildProficiencyGraphModel(current, {
      expandedComponentId: "danielson.framework.component.1a",
    });

    expect(model.nodes.find((node) => node.id === "danielson.tlac.skill.1a-0")).toMatchObject({
      displayScore: 1,
      scoreBand: "red",
    });
    expect(
      model.nodes.find((node) => node.id === "danielson.framework.component.1a"),
    ).toMatchObject({ displayScore: 1.3, scoreBand: "red" });
    expect(
      model.nodes.find((node) => node.id === "danielson.framework.component.1b"),
    ).toMatchObject({ displayScore: 4, scoreBand: "blue" });
    expect(model.nodes.find((node) => node.id === "danielson.framework.domain.1")).toMatchObject({
      displayScore: 2.6,
      scoreBand: "yellow",
    });
    expect(model.nodes.find((node) => node.id === "danielson.framework.domain.2")).toMatchObject({
      displayScore: 3.5,
      scoreBand: "green",
    });
    expect(model.nodes.find((node) => node.id === "danielson.framework.2022")).toMatchObject({
      displayScore: 2.9,
      scoreBand: "yellow",
    });
    expect(
      model.nodes.find((node) => node.id === "danielson.framework.component.2b"),
    ).toMatchObject({ displayScore: null, scoreBand: "neutral" });
  });

  it("builds a collapsed deterministic hierarchy without mutating report data", () => {
    const current = projectCurrentProficiency({ priorities: priorities() });
    const snapshot = structuredClone(current);
    const first = buildProficiencyGraphModel(current);
    const second = buildProficiencyGraphModel(current);

    expect(first.nodes).toHaveLength(27);
    expect(first.edges).toHaveLength(26);
    expect(first.nodes.find((node) => node.kind === "framework")).toMatchObject({ x: 0, y: 0 });
    expect(first.nodes.filter((node) => node.kind === "skill")).toHaveLength(0);
    expect(first).toEqual(second);
    expect(current).toEqual(snapshot);
  });

  it("expands one component with only its direct skills and replaces the prior expansion", () => {
    const current = projectCurrentProficiency({ priorities: priorities() });
    const firstComponent = current.domains[0].components[0];
    const secondComponent = current.domains[0].components[1];
    const first = buildProficiencyGraphModel(current, {
      expandedComponentId: firstComponent.componentId,
    });
    const second = buildProficiencyGraphModel(current, {
      expandedComponentId: secondComponent.componentId,
    });

    expect(first.nodes.filter((node) => node.kind === "skill").map((node) => node.id)).toEqual(
      firstComponent.skills.map((skill) => skill.skillId),
    );
    expect(
      first.edges.filter((edge) => edge.kind === "contains" && edge.targetId.includes(".skill.")),
    ).toHaveLength(firstComponent.skills.length);
    expect(second.nodes.some((node) => node.id === firstComponent.skills[0]?.skillId)).toBe(false);
  });

  it("projects skill status, due state, target rank, and evidence without private fields", () => {
    const current = projectCurrentProficiency({ priorities: priorities() });
    const targetSkillId = current.priorityTargets[0]?.skillId;
    const component = current.domains
      .flatMap((domain) => domain.components)
      .find((candidate) => candidate.skills.some((skill) => skill.skillId === targetSkillId));
    if (!component) throw new Error("priority target component missing");
    const model = buildProficiencyGraphModel(current, {
      expandedComponentId: component.componentId,
    });
    const skill = model.nodes.find((node) => node.kind === "skill");

    expect(skill).toMatchObject({
      state: "below_proficient",
      due: true,
      overdueDays: 4,
      sourceRecordId: expect.stringContaining("observation_records:"),
    });
    expect(skill).toHaveProperty("priorityRank");
    expect(skill).not.toHaveProperty("comment");
    expect(skill).not.toHaveProperty("response");
  });

  it("projects component rating data and its evidence link", () => {
    const current = projectCurrentProficiency({
      priorities: [],
      componentEvidence: [
        {
          componentId: "danielson.framework.component.1a",
          rawRating: 4,
          sourceRecordId: "observation_records:component-source",
        },
      ],
    });
    const model = buildProficiencyGraphModel(current);
    const component = model.nodes.find((node) => node.id === "danielson.framework.component.1a");

    expect(component).toMatchObject({
      rawRating: 4,
      points: 100,
      sourceRecordId: "observation_records:component-source",
      evidenceHref: "/observations/records/observation_records%3Acomponent-source",
    });
  });

  it("computes bounds from the deterministic node positions", () => {
    const current = projectCurrentProficiency({ priorities: priorities() });
    const model = buildProficiencyGraphModel(current);

    expect(model.bounds.minX).toBeLessThan(model.bounds.maxX);
    expect(model.bounds.minY).toBeLessThan(model.bounds.maxY);
    expect(model.bounds.width).toBe(model.bounds.maxX - model.bounds.minX);
    expect(model.bounds.height).toBe(model.bounds.maxY - model.bounds.minY);
  });
});
