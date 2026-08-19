import { buildDanielsonGraph } from '../proficiency/graph';
import type {
  GbfActionStep,
  GbfPhase,
  GbfSequenceRelease,
  GbfSourceManifest,
  GbfValidationResult,
} from './contracts';
import {
  GBF_MAPPING_RELEASE,
} from './mappings';

export { GBF_MAPPING_RELEASE, GBF_UNSEQUENCED_SKILL_IDS } from './mappings';

export const GBF_SOURCE_MANIFESTS: GbfSourceManifest[] = [
  {
    sourceId: 'gbf.scope-sequence.2018',
    filename: 'get-better-faster-scope-sequence.pdf',
    sha256: 'cf34c7ed03fd63fb0c89cb378b1fcacde4c6dc5a7238fc1b9cb059ddf733de64',
    pageCount: 5,
    use: 'normative_sequence',
    editionContext: 'The user identified this file as the GBF 2.0 scope and sequence. The file does not state an edition.',
  },
  {
    sourceId: 'classroom-insights.2025-2026',
    filename: 'Classroom-Insights-Handbook_25-26-1.pdf',
    sha256: '9de9a26d9acdea6fd134c50fec300822fb652f385cd1fe5cbff6b518ee311828',
    pageCount: 5,
    use: 'implementation_context',
    editionContext: 'Implementation example only. It does not define the GBF sequence.',
  },
  {
    sourceId: 'sibling.tlac3.modules',
    filename: '../hdkwa-danielson/src/data/techniques/',
    sha256: '4704ae10511d27c4b3cc7951c0aadfe48558aa86e1148f8ba4f116383fe7cb1b',
    pageCount: 0,
    use: 'tlac_skill_inventory',
    editionContext: 'App-owned snapshot of the reviewed TLAC 3.0 module inventory.',
    siblingCommit: '4ad319e57022ab8e334a594ee12c84a7a8886be7',
    recordCount: 63,
  },
];

const phases: GbfPhase[] = [
  { phaseId: 'phase_1', name: 'Pre-teaching', sourcePage: 1 },
  { phaseId: 'phase_2', name: 'Days 1–30', sourcePage: 2 },
  { phaseId: 'phase_3', name: 'Days 31–60', sourcePage: 3 },
  { phaseId: 'phase_4', name: 'Days 61–90', sourcePage: 4 },
  { phaseId: 'stretch_it', name: 'Next steps', sourcePage: 5 },
];

const required = (
  actionStepId: string,
  phaseId: GbfActionStep['phaseId'],
  trajectory: GbfActionStep['trajectory'],
  trajectoryOrder: number,
  sourceNumber: number,
  name: string,
  sourcePage: number,
): GbfActionStep => ({
  actionStepId,
  phaseId,
  trajectory,
  trajectoryOrder,
  sourceNumber,
  name,
  sourcePage,
  status: 'required',
});

const preview = (actionStepId: string, name: string): GbfActionStep => ({
  actionStepId,
  phaseId: 'phase_1',
  trajectory: 'management',
  trajectoryOrder: 0,
  sourceNumber: null,
  name,
  sourcePage: 1,
  status: 'preview',
});

const actionSteps: GbfActionStep[] = [
  required('phase_1.management.1', 'phase_1', 'management', 1, 1, 'Routines and Procedures 101', 1),
  required('phase_1.management.2', 'phase_1', 'management', 2, 2, 'Strong Voice', 1),
  preview('phase_1.management.preview.least-invasive-intervention', 'Least Invasive Intervention'),
  preview('phase_1.management.preview.narrate-positive', 'Narrate the Positive'),
  preview('phase_1.management.preview.build-momentum', 'Create a Challenge or Build Momentum'),
  preview('phase_1.management.preview.teacher-radar', 'Teacher Radar'),
  preview('phase_1.management.preview.do-it-again', 'Do It Again'),
  required('phase_1.rigor.1', 'phase_1', 'rigor', 1, 1, 'Develop Effective Lesson Plans 101', 1),
  required('phase_1.rigor.2', 'phase_1', 'rigor', 2, 2, 'Internalize Existing Lesson Plans', 1),
  required('phase_2.management.1', 'phase_2', 'management', 3, 1, 'What to Do', 2),
  required('phase_2.management.2', 'phase_2', 'management', 4, 2, 'Routines and Procedures 201', 2),
  required('phase_2.management.3', 'phase_2', 'management', 5, 3, 'Teacher Radar', 2),
  required('phase_2.management.4', 'phase_2', 'management', 6, 4, 'Whole-Class Reset', 2),
  required('phase_2.rigor.3', 'phase_2', 'rigor', 3, 3, 'Write the Exemplar', 2),
  required('phase_2.rigor.4', 'phase_2', 'rigor', 4, 4, 'Independent Practice', 2),
  required('phase_2.rigor.5', 'phase_2', 'rigor', 5, 5, 'Monitor Aggressively', 2),
  required('phase_3.management.5', 'phase_3', 'management', 7, 5, 'Build the Momentum', 3),
  required('phase_3.management.6', 'phase_3', 'management', 8, 6, 'Pacing', 3),
  required('phase_3.management.7', 'phase_3', 'management', 9, 7, 'Engage All Students', 3),
  required('phase_3.management.8', 'phase_3', 'management', 10, 8, 'Narrate the Positive', 3),
  required('phase_3.management.9', 'phase_3', 'management', 11, 9, 'Individual Student Corrections', 3),
  required('phase_3.rigor.6', 'phase_3', 'rigor', 6, 6, 'Habits of Evidence', 3),
  required('phase_3.rigor.7', 'phase_3', 'rigor', 7, 7, 'Check for Whole-Group Understanding', 3),
  required('phase_3.rigor.8', 'phase_3', 'rigor', 8, 8, 'Re-teaching 101 - Model', 3),
  required('phase_4.management.10', 'phase_4', 'management', 12, 10, 'Engaged Small Group Work', 4),
  required('phase_4.rigor.9', 'phase_4', 'rigor', 9, 9, 'Re-teaching 201 - Guided Discourse', 4),
  required('phase_4.rigor.10', 'phase_4', 'rigor', 10, 10, 'Universal Prompts', 4),
  required('phase_4.rigor.11', 'phase_4', 'rigor', 11, 11, 'Habits of Discussion', 4),
  required('stretch_it.rigor.12', 'stretch_it', 'rigor', 12, 12, 'Strategic Prompts', 5),
  required('stretch_it.rigor.13', 'stretch_it', 'rigor', 13, 13, 'Go Conceptual', 5),
];

export const GBF_SEQUENCE_RELEASE: GbfSequenceRelease = {
  releaseId: 'danielson.gbf.sequence.2026-08-19.v1',
  effectiveDate: '2026-08-19',
  sourceManifestHashes: GBF_SOURCE_MANIFESTS.map((source) => source.sha256),
  phases,
  actionSteps,
};

function duplicateValues(values: readonly string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return duplicates;
}

/** Validate the frozen sequence and mapping boundary. */
export function validateGbfSourceRelease(input: {
  sequence: GbfSequenceRelease;
  mapping: typeof GBF_MAPPING_RELEASE;
}): GbfValidationResult {
  const issues: GbfValidationResult['issues'] = [];
  const expectedHashes = GBF_SOURCE_MANIFESTS.map((source) => source.sha256);
  if (JSON.stringify(input.sequence.sourceManifestHashes) !== JSON.stringify(expectedHashes)) {
    issues.push({ code: 'SOURCE_HASH_MISMATCH', message: 'Source hashes do not match the frozen manifest.' });
  }
  for (const id of duplicateValues(input.sequence.actionSteps.map((step) => step.actionStepId))) {
    issues.push({ code: 'DUPLICATE_ACTION_STEP', message: 'Action-step IDs must be unique.', recordId: id });
  }
  for (const id of duplicateValues(input.mapping.mappings.map((item) => item.mappingId))) {
    issues.push({ code: 'DUPLICATE_MAPPING', message: 'Mapping IDs must be unique.', recordId: id });
  }
  const actionIds = new Set(input.sequence.actionSteps.map((step) => step.actionStepId));
  const skillIds = new Set(buildDanielsonGraph().graph.nodes
    .filter((node) => node.kind === 'skill' && node.reviewStatus === 'approved')
    .map((node) => node.id));
  for (const item of input.mapping.mappings) {
    if (!actionIds.has(item.actionStepId)) {
      issues.push({ code: 'UNKNOWN_ACTION_STEP', message: 'A mapping has an unknown action step.', recordId: item.mappingId });
    }
    if (!skillIds.has(item.skillId)) {
      issues.push({ code: 'UNKNOWN_SKILL', message: 'A mapping has an unknown skill.', recordId: item.mappingId });
    }
    if (!item.rationale.trim() || !item.reviewAuthor.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(item.reviewDate)) {
      issues.push({ code: 'MISSING_MAPPING_PROVENANCE', message: 'A mapping lacks review provenance.', recordId: item.mappingId });
    }
  }
  for (const step of input.sequence.actionSteps) {
    const primaries = input.mapping.mappings.filter((item) => (
      item.actionStepId === step.actionStepId && item.role === 'primary'
    ));
    if (primaries.length !== 1) {
      issues.push({ code: 'INVALID_PRIMARY_COUNT', message: 'Each action step needs one primary mapping.', recordId: step.actionStepId });
    }
  }
  for (const skillId of input.mapping.unsequencedSkillIds) {
    if (!skillIds.has(skillId) || input.mapping.mappings.some((item) => item.skillId === skillId)) {
      issues.push({ code: 'INVALID_UNSEQUENCED_SKILL', message: 'An unsequenced skill is invalid or mapped.', recordId: skillId });
    }
  }
  return { valid: issues.length === 0, issues };
}
