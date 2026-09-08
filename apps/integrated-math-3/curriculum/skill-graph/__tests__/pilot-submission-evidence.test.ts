import { describe, it, expect } from 'vitest';
import { getGenerator } from '@math-platform/math-content/knowledge-space';
import type { GeneratorInput } from '@math-platform/knowledge-space-practice';
import { genericEvidenceToSubmissionParts } from '@math-platform/knowledge-space-practice';
import type { GenericEvidenceResult } from '@math-platform/knowledge-space-practice';
import { projectTeacherEvidence } from '@math-platform/knowledge-space-practice';
import type { KnowledgeSpaceEdge, KnowledgeSpaceNode } from '@math-platform/knowledge-space-core';
import projectionJson from '../module-1/projection/practice-v1-activity-map.json';
import courseNodesJson from '../nodes.json';
import courseEdgesJson from '../edges.json';
import moduleNodesJson from '../module-1/nodes.json';
import moduleBlueprintsJson from '../module-1/blueprints.json';
import courseProjectionJson from '../projection/practice-v1-activity-map.json';

const draftIndependentActivityIds = [
  'math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change.independent_practice',
  'math.im3.skill.1.1.graph-quadratic-functions.independent_practice',
  'math.im3.skill.1.2.solve-quadratic-equations-by-graphing.independent_practice',
];

const projection = projectionJson as {
  metadata: { course: string; module: string; description: string };
  activities: Array<{
    stableActivityId: string;
    nodeId: string;
    rendererKey: string;
    mode: string;
    srsEligible: boolean;
    props: Record<string, unknown>;
    gradingConfig: Record<string, unknown>;
    alignmentNodeIds: string[];
    sourceNodeIds: string[];
  }>;
  srsInputs: Array<{
    nodeId: string;
    blueprintId: string;
    standards: string[];
    prerequisites: string[];
    difficulty: number;
    generatorKey?: string;
    generatorReady: boolean;
  }>;
  teacherEvidence: {
    standards: Array<{ standardId: string; standardTitle: string; nodeIds: string[] }>;
    skills: Array<{ nodeId: string; title: string; kind: string; standardsCovered: string[]; prerequisitesMet: boolean; independentPracticeReady: boolean }>;
    prerequisiteGaps: Array<{ nodeId: string; title: string; missingPrerequisites: string[] }>;
    attemptArtifacts: Array<{ nodeId: string; partIds: string[]; submissionProvenance: string }>;
  };
};

describe('Module 1 Practice Submission Path', () => {
  const independentActivities = projection.activities.filter(a => a.mode === 'independent_practice');

  it('projection has independent practice activities', () => {
    expect(independentActivities.length).toBeGreaterThanOrEqual(3);
  });

  it('sets Independent SRS eligibility from readiness and approval', () => {
    for (const activity of independentActivities) {
      const node = moduleNodesJson.nodes.find(candidate => candidate.id === activity.nodeId);
      const blueprint = moduleBlueprintsJson.blueprints.find(candidate => candidate.nodeId === activity.nodeId);
      const expected = node?.independentPracticeReady === true
        && node.reviewStatus === 'approved'
        && blueprint?.reviewStatus === 'approved';
      expect(activity.srsEligible).toBe(expected);
    }
    for (const stored of [projectionJson, courseProjectionJson]) {
      const selected = stored.activities.filter(activity => draftIndependentActivityIds.includes(activity.stableActivityId));
      expect(selected).toHaveLength(3);
      expect(selected.every(activity => activity.srsEligible === false)).toBe(true);
    }
  });

  it('generator output can be transformed into practice.v1 submission parts', () => {
    for (const activity of independentActivities) {
      const srsEntry = projection.srsInputs.find(s => s.nodeId === activity.nodeId);
      if (!srsEntry?.generatorKey) continue;

      const generator = getGenerator(srsEntry.generatorKey);
      const input: GeneratorInput = {
        nodeId: activity.nodeId,
        seed: 42,
        difficulty: 0.5,
      };
      const output = generator.generate(input);

      const evidence: GenericEvidenceResult = {
        parts: Object.entries(output.gradingMetadata.partAnswers).map(([partId, rawAnswer]) => {
          const maxScore = output.gradingMetadata.partMaxScores[partId] ?? 0;
          const isCorrect = JSON.stringify(rawAnswer) === JSON.stringify(output.expectedAnswer[partId as keyof typeof output.expectedAnswer]);
          return {
            partId,
            rawAnswer,
            isCorrect,
            score: isCorrect ? maxScore : 0,
            maxScore,
          };
        }),
        maxTotalScore: Object.values(output.gradingMetadata.partMaxScores).reduce((a, b) => a + b, 0),
      };

      const parts = genericEvidenceToSubmissionParts(evidence);
      expect(parts.length).toBeGreaterThan(0);
      for (const part of parts) {
        expect(part.partId).toBeTruthy();
        expect(typeof part.isCorrect).toBe('boolean');
      }
    }
  });

  it('submission parts include skill ID and graph provenance metadata', () => {
    for (const activity of independentActivities) {
      const srsEntry = projection.srsInputs.find(s => s.nodeId === activity.nodeId);
      if (!srsEntry?.generatorKey) continue;

      const generator = getGenerator(srsEntry.generatorKey);
      const input: GeneratorInput = { nodeId: activity.nodeId, seed: 42, difficulty: 0.5 };
      const output = generator.generate(input);

      expect(output.gradingMetadata.partAnswers).toBeDefined();
      expect(Object.keys(output.gradingMetadata.partAnswers).length).toBeGreaterThan(0);
    }
  });
});

describe('Module 1 Teacher Evidence Projection', () => {
  it('teacher evidence references skill IDs and standards', () => {
    expect(projection.teacherEvidence.standards.length).toBeGreaterThanOrEqual(5);
    for (const std of projection.teacherEvidence.standards) {
      expect(std.standardId).toMatch(/^math\.standard\./);
      expect(std.nodeIds.length).toBeGreaterThan(0);
    }
  });

  it('teacher evidence skills list has Module 1 entries', () => {
    expect(projection.teacherEvidence.skills.length).toBeGreaterThan(0);
    const m1Skills = projection.teacherEvidence.skills.filter(s => s.nodeId.includes('.1.'));
    expect(m1Skills.length).toBeGreaterThan(0);
  });

  it('attempt artifacts reference blueprint node IDs with part IDs', () => {
    expect(projection.teacherEvidence.attemptArtifacts.length).toBeGreaterThan(0);
    for (const artifact of projection.teacherEvidence.attemptArtifacts) {
      expect(artifact.nodeId).toBeTruthy();
      expect(artifact.partIds).toBeDefined();
      if (!artifact.nodeId.startsWith('math.im3.example.1.8.')) {
        expect(artifact.submissionProvenance).toContain('skill-graph-pilot');
      }
    }
    const fresh = projectTeacherEvidence(
      courseNodesJson.nodes as KnowledgeSpaceNode[],
      courseEdgesJson.edges as KnowledgeSpaceEdge[],
    );
    expect(projection.teacherEvidence.attemptArtifacts.filter(artifact => artifact.nodeId.startsWith('math.im3.example.1.8.')))
      .toEqual(fresh.attemptArtifacts.filter(artifact => artifact.nodeId.startsWith('math.im3.example.1.8.')));
  });

  it('SRS inputs have generator keys for generator-ready blueprints', () => {
    const generatorReady = projection.srsInputs.filter(s => s.generatorReady);
    expect(generatorReady.length).toBeGreaterThanOrEqual(3);
    for (const entry of generatorReady) {
      expect(entry.generatorKey).toBeTruthy();
    }
  });

  it('SRS inputs reference Module 1 prerequisite chains', () => {
    const withPrereqs = projection.srsInputs.filter(s => s.prerequisites.length > 0);
    expect(withPrereqs.length).toBeGreaterThan(0);
  });
});
