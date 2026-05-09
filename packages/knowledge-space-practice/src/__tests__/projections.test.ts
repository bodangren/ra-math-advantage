import { describe, it, expect } from 'vitest';
import {
  syntheticMathFixture,
  syntheticEnglishGseFixture,
} from '@math-platform/knowledge-space-core';
import type { KnowledgeBlueprint } from '../blueprints';

import { projectActivityMap } from '../projections/activity-map';
import { projectSrsInputs } from '../projections/srs';
import { projectTeacherEvidence } from '../projections/teacher-evidence';
import {
  projectStudentVisualization,
  projectParentVisualization,
  projectTeacherVisualization,
} from '../projections/visualization';

import {
  studentVisualizationV1Schema,
  parentVisualizationV1Schema,
  teacherVisualizationV1Schema,
} from '../projections/schemas';

import {
  syntheticBlueprint,
  syntheticEnglishBlueprintProjection,
  syntheticLearnerState,
} from '../projections/fixtures';

// ---------------------------------------------------------------------------
// Task 1.1: Activity map projection test
// ---------------------------------------------------------------------------
describe('Activity map projection', () => {
  it('produces valid activity map rows from synthetic math fixture + blueprint', () => {
    const nodes = syntheticMathFixture.nodes;
    const edges = syntheticMathFixture.edges;
    const blueprints: KnowledgeBlueprint[] = [syntheticBlueprint];

    const rows = projectActivityMap(nodes, edges, blueprints);

    expect(rows.length).toBeGreaterThan(0);

    for (const row of rows) {
      expect(row).toHaveProperty('stableActivityId');
      expect(row).toHaveProperty('nodeId');
      expect(row).toHaveProperty('sourceNodeIds');
      expect(row).toHaveProperty('rendererKey');
      expect(row).toHaveProperty('mode');
      expect(row).toHaveProperty('alignmentNodeIds');
      expect(row).toHaveProperty('props');
      expect(row).toHaveProperty('gradingConfig');
      expect(row).toHaveProperty('srsEligible');

      expect(typeof row.stableActivityId).toBe('string');
      expect(typeof row.nodeId).toBe('string');
      expect(Array.isArray(row.sourceNodeIds)).toBe(true);
      expect(typeof row.rendererKey).toBe('string');
      expect([
        'worked_example',
        'guided_practice',
        'independent_practice',
        'assessment',
      ]).toContain(row.mode);
      expect(Array.isArray(row.alignmentNodeIds)).toBe(true);
    }
  });

  it('includes knowledge-space provenance in activity map rows', () => {
    const nodes = syntheticMathFixture.nodes;
    const edges = syntheticMathFixture.edges;
    const blueprints: KnowledgeBlueprint[] = [syntheticBlueprint];

    const rows = projectActivityMap(nodes, edges, blueprints);

    const factoringRow = rows.find((r) =>
      r.nodeId.includes('factoring-drill'),
    );
    expect(factoringRow).toBeDefined();
    expect(factoringRow!.alignmentNodeIds.length).toBeGreaterThan(0);
    expect(factoringRow!.alignmentNodeIds).toContain(
      'math.im3.standard.ccss.hsa.rei.b.4b',
    );
  });
});

// ---------------------------------------------------------------------------
// Task 1.2: Component props validation test
// ---------------------------------------------------------------------------
describe('Component props validation', () => {
  it('generated activity props are well-formed', () => {
    const nodes = syntheticMathFixture.nodes;
    const edges = syntheticMathFixture.edges;
    const blueprints: KnowledgeBlueprint[] = [syntheticBlueprint];

    const rows = projectActivityMap(nodes, edges, blueprints);

    for (const row of rows) {
      expect(typeof row.props).toBe('object');
      expect(row.props).not.toBeNull();
      expect(Object.keys(row.props).length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Task 1.3: SRS projection test
// ---------------------------------------------------------------------------
describe('SRS projection', () => {
  it('includes prerequisite IDs and standard/objective IDs', () => {
    const nodes = syntheticMathFixture.nodes;
    const edges = syntheticMathFixture.edges;
    const blueprints: KnowledgeBlueprint[] = [syntheticBlueprint];

    const entries = projectSrsInputs(nodes, edges, blueprints);

    expect(entries.length).toBeGreaterThan(0);

    for (const entry of entries) {
      expect(typeof entry.nodeId).toBe('string');
      expect(typeof entry.blueprintId).toBe('string');
      expect(Array.isArray(entry.standards)).toBe(true);
      expect(Array.isArray(entry.prerequisites)).toBe(true);
      expect(typeof entry.difficulty).toBe('number');
      expect(typeof entry.generatorReady).toBe('boolean');
    }

    // At least one entry should have prerequisite info
    const entryWithPrereqs = entries.find((e) => e.prerequisites.length > 0);
    expect(entryWithPrereqs).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Task 1.4: Visualization projection tests
// ---------------------------------------------------------------------------
describe('Visualization projections', () => {
  const nodes = syntheticMathFixture.nodes;
  const edges = syntheticMathFixture.edges;

  describe('Student visualization', () => {
    it('includes mastered, ready, blocked, review-due, and recommended-next states', () => {
      const viz = projectStudentVisualization(nodes, edges, syntheticLearnerState);

      expect(viz.schemaVersion).toBe('v1');
      expect(Array.isArray(viz.mastered)).toBe(true);
      expect(Array.isArray(viz.ready)).toBe(true);
      expect(Array.isArray(viz.blocked)).toBe(true);
      expect(Array.isArray(viz.reviewDue)).toBe(true);
      expect(Array.isArray(viz.recommendedNext)).toBe(true);
      expect(Array.isArray(viz.edges)).toBe(true);

      const result = studentVisualizationV1Schema.safeParse(viz);
      expect(result.success).toBe(true);
    });

    it('does not expose raw graph fields in visualization nodes', () => {
      const viz = projectStudentVisualization(nodes, edges, syntheticLearnerState);

      for (const node of viz.mastered) {
        expect(node).toHaveProperty('nodeId');
        expect(node).toHaveProperty('title');
        expect(node).toHaveProperty('state');
        expect(node).not.toHaveProperty('metadata');
        expect(node).not.toHaveProperty('sourceRefs');
        expect(node).not.toHaveProperty('reviewStatus');
      }
    });
  });

  describe('Parent visualization', () => {
    it('includes plain-language can-do summary, next focus, blockers, progress trend', () => {
      const viz = projectParentVisualization(nodes, edges, syntheticLearnerState);

      expect(viz.schemaVersion).toBe('v1');
      expect(typeof viz.canDoSummary).toBe('string');
      expect(typeof viz.nextFocus).toBe('string');
      expect(Array.isArray(viz.blockers)).toBe(true);
      expect(['improving', 'stable', 'declining', 'unknown']).toContain(
        viz.progressTrend,
      );
      expect(Array.isArray(viz.nodes)).toBe(true);

      const result = parentVisualizationV1Schema.safeParse(viz);
      expect(result.success).toBe(true);
    });
  });

  describe('Teacher visualization', () => {
    const classStats = {
      'math.im3.skill.m1.l2.solve-quadratic-by-factoring': {
        mastered: 12,
        total: 20,
      },
      'math.im3.skill.m1.l2.identify-roots': {
        mastered: 15,
        total: 20,
      },
    };

    it('includes heatmap cells, bottleneck nodes, prerequisite gaps, misconception clusters, intervention groups, standards coverage', () => {
      const viz = projectTeacherVisualization(nodes, edges, classStats);

      expect(viz.schemaVersion).toBe('v1');
      expect(Array.isArray(viz.heatmap)).toBe(true);
      expect(Array.isArray(viz.bottleneckNodes)).toBe(true);
      expect(Array.isArray(viz.prerequisiteGaps)).toBe(true);
      expect(Array.isArray(viz.misconceptionClusters)).toBe(true);
      expect(Array.isArray(viz.interventionGroups)).toBe(true);
      expect(Array.isArray(viz.standardsCoverage)).toBe(true);

      if (viz.heatmap.length > 0) {
        const cell = viz.heatmap[0];
        expect(typeof cell.nodeId).toBe('string');
        expect(typeof cell.title).toBe('string');
        expect(typeof cell.masteredCount).toBe('number');
        expect(typeof cell.totalCount).toBe('number');
        expect(typeof cell.proficiencyRate).toBe('number');
        expect(cell.proficiencyRate).toBeGreaterThanOrEqual(0);
        expect(cell.proficiencyRate).toBeLessThanOrEqual(1);
      }

      const result = teacherVisualizationV1Schema.safeParse(viz);
      expect(result.success).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Task 1.5: Cross-domain smoke test
// ---------------------------------------------------------------------------
describe('Cross-domain smoke test (English/GSE)', () => {
  it('projection source files contain no math-domain or app imports (boundary check)', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const projectionFiles = [
      '../projections/activity-map.ts',
      '../projections/srs.ts',
      '../projections/teacher-evidence.ts',
      '../projections/visualization.ts',
      '../projections/fixtures.ts',
      '../projections/schemas.ts',
      '../projections/types.ts',
    ];
    for (const file of projectionFiles) {
      const content = readFileSync(resolve(__dirname, file), 'utf-8');
      expect(content, `${file} must not import from apps/`).not.toMatch(/from ['"].*apps\//);
      expect(content, `${file} must not import from math-content`).not.toMatch(/from ['"].*math-content/);
      expect(content, `${file} must not import from convex/_generated`).not.toMatch(/from ['"].*convex\/_generated/);
    }
  });

  it('runs full projection pipeline on non-math fixture', () => {
    const nodes = syntheticEnglishGseFixture.nodes;
    const edges = syntheticEnglishGseFixture.edges;
    const blueprints: KnowledgeBlueprint[] = [syntheticEnglishBlueprintProjection];
    const learnerState: Record<string, 'mastered' | 'ready' | 'blocked' | 'review_due'> = {
      'english.gse.skill.b1.reading.infer-meaning-context': 'mastered',
      'english.gse.skill.b1.reading.identify-main-idea.short-text': 'ready',
    };
    const classStats = {
      'english.gse.skill.b1.reading.identify-main-idea.short-text': {
        mastered: 8,
        total: 15,
      },
    };

    // Activity map
    const activityRows = projectActivityMap(nodes, edges, blueprints);
    expect(activityRows.length).toBeGreaterThan(0);

    // SRS
    const srsEntries = projectSrsInputs(nodes, edges, blueprints);
    expect(srsEntries.length).toBeGreaterThan(0);

    // Teacher evidence
    const evidence = projectTeacherEvidence(nodes, edges);
    expect(evidence).toHaveProperty('standards');
    expect(evidence).toHaveProperty('skills');
    expect(evidence).toHaveProperty('prerequisiteGaps');
    expect(evidence).toHaveProperty('attemptArtifacts');

    // Student visualization
    const studentViz = projectStudentVisualization(nodes, edges, learnerState);
    const studentResult = studentVisualizationV1Schema.safeParse(studentViz);
    expect(studentResult.success).toBe(true);

    // Parent visualization
    const parentViz = projectParentVisualization(nodes, edges, learnerState);
    const parentResult = parentVisualizationV1Schema.safeParse(parentViz);
    expect(parentResult.success).toBe(true);

    // Teacher visualization
    const teacherViz = projectTeacherVisualization(nodes, edges, classStats);
    const teacherResult = teacherVisualizationV1Schema.safeParse(teacherViz);
    expect(teacherResult.success).toBe(true);
  });
});
