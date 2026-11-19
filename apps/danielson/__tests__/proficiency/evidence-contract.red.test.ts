import { describe, expect, it } from "vitest";

import {
  COMPONENT_1E,
  SKILL_IDS,
  createFixtureGraph,
  createNoEvidence,
  createRatedEvidence,
} from "./fixtures";

const evidenceModule = () => import("../../lib/proficiency/evidence");

describe("Danielson observation evidence contract", () => {
  it("normalizes rated and not-enough-evidence records with all required provenance fields", async () => {
    const { normalizeObservationEvidence } = await evidenceModule();
    const graph = createFixtureGraph();
    const rated = normalizeObservationEvidence(
      createRatedEvidence({
        targetSkillIds: [...SKILL_IDS].reverse(),
      }),
      graph,
    );
    const noEvidence = normalizeObservationEvidence(createNoEvidence(), graph);

    expect(rated).toMatchObject({
      kind: "rated",
      organizationId: expect.any(String),
      teacherId: expect.any(String),
      sourceRecordId: expect.any(String),
      formalObservationId: expect.any(String),
      sourceType: "formal_q1",
      componentId: COMPONENT_1E,
      observerId: expect.any(String),
      occurredAt: expect.any(String),
      sourceVersion: expect.any(String),
      provenanceGroupId: expect.any(String),
      idempotencyKey: expect.any(String),
      rating: 3,
    });
    expect(rated.targetSkillIds).toEqual([...SKILL_IDS].sort());
    expect(noEvidence).toMatchObject({ kind: "not_enough_evidence" });
    expect(noEvidence).not.toHaveProperty("rating");
  });

  it("accepts the documented command fields and nested outcome", async () => {
    const { normalizeObservationEvidence } = await evidenceModule();
    const source = createRatedEvidence();
    const documented = {
      idempotencyKey: source.idempotencyKey,
      organizationId: source.organizationId,
      teacherProfileId: source.teacherId,
      observerAccountId: source.observerId,
      sourceRecordId: source.sourceRecordId,
      formalObservationId: source.formalObservationId,
      sourceType: source.sourceType,
      componentId: source.componentId,
      targetSkillIds: source.targetSkillIds,
      eventTime: source.occurredAt,
      sourceVersion: source.sourceVersion,
      provenanceGroupId: source.provenanceGroupId,
      outcome: { kind: "rated", rating: source.rating },
    };

    expect(normalizeObservationEvidence(documented, createFixtureGraph())).toEqual(
      normalizeObservationEvidence(source, createFixtureGraph()),
    );
  });

  it("uses normalized content for logical equality even when the caller orders targets differently", async () => {
    const { normalizeObservationEvidence } = await evidenceModule();
    const graph = createFixtureGraph();
    const first = normalizeObservationEvidence(
      createRatedEvidence({
        targetSkillIds: [...SKILL_IDS],
      }),
      graph,
    );
    const reordered = normalizeObservationEvidence(
      createRatedEvidence({
        targetSkillIds: [...SKILL_IDS].reverse(),
      }),
      graph,
    );

    expect(reordered).toEqual(first);
  });

  it("rejects invalid ratings, missing provenance, unknown targets, and targets outside the component", async () => {
    const { normalizeObservationEvidence } = await evidenceModule();
    const graph = createFixtureGraph();
    const outsideSkillId = "danielson.tlac.skill.outside-component";
    graph.nodes.push({
      id: outsideSkillId,
      kind: "skill",
      title: "Outside component skill",
      domain: "danielson",
      sourceRefs: [{ source: "test" }],
      reviewStatus: "approved",
      metadata: {},
    });
    graph.edges.push({
      id: "danielson.edge.contains.1a.outside-component",
      type: "contains",
      sourceId: "danielson.framework.component.1a",
      targetId: outsideSkillId,
      weight: 1,
      confidence: "high",
      sourceRefs: [{ source: "test" }],
      reviewStatus: "approved",
      metadata: {},
    });

    expect(() => normalizeObservationEvidence(createRatedEvidence({ rating: 5 }), graph)).toThrow();
    expect(() =>
      normalizeObservationEvidence(createRatedEvidence({ observerId: undefined }), graph),
    ).toThrow();
    expect(() =>
      normalizeObservationEvidence(
        createRatedEvidence({
          targetSkillIds: ["danielson.tlac.skill.missing"],
        }),
        graph,
      ),
    ).toThrow();
    expect(() =>
      normalizeObservationEvidence(
        createRatedEvidence({
          targetSkillIds: [outsideSkillId],
        }),
        graph,
      ),
    ).toThrow();
  });

  it("rejects comments and teacher responses at the scoring-contract boundary", async () => {
    const { normalizeObservationEvidence } = await evidenceModule();
    const graph = createFixtureGraph();

    for (const field of ["publicComment", "privateComment", "teacherResponse"] as const) {
      expect(() =>
        normalizeObservationEvidence(createRatedEvidence({ [field]: "must not score" }), graph),
      ).toThrow();
    }
  });
});
